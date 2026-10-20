"""
TrueTrace AI - Main FastAPI Application
Cross-platform API server providing authentication, validation, risk engine,
and reporting services.
"""
import time
from collections import defaultdict
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1 import auth, scans, dashboard, integrations, admin, health, validation

# Create database tables automatically for development
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Cross-platform digital identity and scam risk assessment engine.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows cross-origin development from web, desktop, and mobile
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Rate Limiting Tracker
client_request_counts = defaultdict(list)

@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # 1. Rate Limiting Check
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Filter timestamps older than 60 seconds
    timestamps = [t for t in client_request_counts[client_ip] if now - t < 60]
    if len(timestamps) >= settings.RATE_LIMIT_PER_MINUTE:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Too many requests. Please slow down and try again shortly."}
        )
    timestamps.append(now)
    client_request_counts[client_ip] = timestamps

    # 2. Process Request
    response = await call_next(request)

    # 3. Inject Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"

    return response

# Include Versioned API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(scans.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(integrations.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(validation.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "tagline": "Verify Signals. Detect Risks. Stay Safe.",
        "version": settings.VERSION,
        "docs": "/docs",
        "api": settings.API_V1_STR,
    }
