"""
Authentication Router: Registration, login, profile, and account management.
"""
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserUpdate, UserProfileResponse, AuthResponse, TokenResponse
from app.api.deps import get_current_user
from app.services.audit_service import audit_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_profile(user: User) -> UserProfileResponse:
    notif_prefs = None
    if user.notification_preferences:
        try:
            notif_prefs = json.loads(user.notification_preferences)
        except Exception:
            pass
    return UserProfileResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        created_at=user.created_at.isoformat(),
        notification_preferences=notif_prefs,
    )

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, request: Request, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    # First registered account can optionally be admin if configured, else user
    user_count = db.query(User).count()
    role = "admin" if user_count == 0 else "user"

    new_user = User(
        email=clean_email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role=role,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    client_ip = request.client.host if request.client else None
    audit_service.log_event(
        db=db,
        user_id=new_user.id,
        action="AUTH_REGISTER",
        resource="user",
        ip_address=client_ip,
        status="SUCCESS",
    )

    access_token = create_access_token(subject=new_user.id)
    return AuthResponse(
        user=format_user_profile(new_user),
        tokens=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        ),
    )

@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    client_ip = request.client.host if request.client else None

    if not user or not verify_password(payload.password, user.hashed_password):
        audit_service.log_event(
            db=db,
            user_id=user.id if user else None,
            action="AUTH_LOGIN_FAILED",
            resource="user",
            ip_address=client_ip,
            status="FAILED",
            details={"email": clean_email},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password combination.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended or deactivated.",
        )

    audit_service.log_event(
        db=db,
        user_id=user.id,
        action="AUTH_LOGIN_SUCCESS",
        resource="user",
        ip_address=client_ip,
        status="SUCCESS",
    )

    access_token = create_access_token(subject=user.id)
    return AuthResponse(
        user=format_user_profile(user),
        tokens=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        ),
    )

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    audit_service.log_event(
        db=db,
        user_id=current_user.id,
        action="AUTH_LOGOUT",
        resource="user",
        status="SUCCESS",
    )
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return format_user_profile(current_user)

@router.patch("/me", response_model=UserProfileResponse)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.notification_preferences is not None:
        current_user.notification_preferences = json.dumps(payload.notification_preferences)
    
    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(current_user)
    return format_user_profile(current_user)

@router.delete("/me")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id
    db.delete(current_user)
    db.commit()
    return {"message": "Account and associated data deleted permanently."}
