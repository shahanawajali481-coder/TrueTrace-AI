# TrueTrace AI

> **Tagline:** Verify Signals. Detect Risks. Stay Safe.

TrueTrace AI is a cross-platform digital identity and scam risk assessment system. It empowers everyday users, cybersecurity analysts, and fraud investigators to assess potentially fraudulent emails, suspicious social media profiles, impersonation attempts, and phone numbers associated with reported scams across **Web (PWA)**, **Native Android**, and **Windows Desktop**.

Unlike deceptive tools that make false promises about discovering hidden passwords, private direct messages, or guaranteed fake account detection, TrueTrace AI adheres to rigorous cybersecurity engineering principles: **evidence-based explanations, transparent methodology, honest disclosure of unavailable data, and zero platform privacy violations**.

---

## 1. Key Features

1. **Email Address Risk Analysis & Pre-Validation**:
   - RFC 5322 strict syntax verification with deliverability normalization.
   - Authoritative DNS A/AAAA and live MX (Mail Exchange) resolution.
   - Curated disposable and throwaway domain matching.
   - Phishing and authority impersonation keyword heuristics.
   - Dedicated pre-scan endpoint (`POST /api/v1/validate/email`) with client-side live validation.
2. **Instagram Profile Risk Assessment**:
   - Public handle extraction and syntax normalization.
   - Authority spoofing patterns (e.g. `meta_support`, `official_service`).
   - Burner/bot naming patterns (e.g. long trailing digit sequences).
   - Community scam registry queries with transparent API limitation disclosure.
3. **Facebook Link & Page Assessment**:
   - Canonical Facebook hostname validation (detects typo-squatted phishing domains).
   - Impersonation keyword analysis (e.g. page suspension appeals, copyright pretexts).
   - Threat intelligence complaint feed matching.
4. **WhatsApp & Phone Number Telemetry**:
   - ITU-T E.164 normalization using Google's `libphonenumber`.
   - Line classification: Mobile, Fixed-line, VoIP virtual burners, Premium-rate surcharge lines.
   - Geographic numbering region and carrier routing metadata.
   - Dedicated pre-scan endpoint (`POST /api/v1/validate/phone`) with client-side live validation.
5. **Explainable AI Risk Engine**:
   - Deduplication of related indicators (prevents double-penalizing network issues).
   - Evidence reliability weighting (0.0 to 1.0).
   - 4 Transparent Outcomes: `LOW RISK`, `MEDIUM RISK`, `HIGH RISK`, `INCONCLUSIVE`.
   - Deterministic explainability (operates with or without optional LLM keys).
6. **Detailed Audit Reports & Export**:
   - Unique scan UUID, timestamps, and privacy-conscious masked identifiers.
   - Downloadable, tamper-evident PDF reports (built with ReportLab).
   - Structured JSON export for security pipelines.
   - Revocable, tokenized report sharing links.
7. **User Scoping & Security**:
   - Scoped authentication via bcrypt password hashing and JWT access tokens.
   - Role-based administration console for system health and threat registry.
   - In-app notification preferences and GDPR-compliant complete account purge.
8. **Cross-Platform Delivery**:
   - Responsive Web App with Progressive Web App (PWA) installability.
   - Windows desktop application with strict Content Security Policy (CSP), external link sandboxing, and embedded offline client.
   - Native Android application built with React Native Expo, Hermes bytecode bundling, and hardware-backed `SecureStore`.

---

## 2. Architecture & Monorepo Structure

```
TrueTrace AI/
├── backend/                  # Shared FastAPI Python 3.11+ Backend
│   ├── app/
│   │   ├── api/v1/           # Auth, Scans, Validation, Dashboard, Integrations, Admin, Health
│   │   ├── core/             # Configuration, Database engine, JWT/bcrypt Security, Rate Limiter
│   │   ├── models/           # SQLAlchemy Relational Models (User, Scan, Evidence, ScamReport, Audit)
│   │   ├── schemas/          # Pydantic v2 validation contracts (model_config = ConfigDict)
│   │   ├── analyzers/        # Real Email (DNS/MX), Phone (libphonenumber), Social analyzers
│   │   ├── intelligence/     # Explainable Risk Engine, Threat Intel, Disposable Domain Registry
│   │   ├── services/         # Scan orchestration, ValidationService, PDF generation, Audit logger
│   │   └── tests/            # Automated pytest suite (25 tests, 100% pass)
│   ├── alembic/              # Database schema migrations
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── packages/
│   ├── shared-types/         # Shared TypeScript interfaces & build artifact (dist/)
│   └── api-client/           # Cross-platform TypeScript API client (dist/)
├── apps/
│   ├── web/                  # Web App & PWA (React 18, TypeScript, Vite, Tailwind CSS, Recharts, Vitest)
│   │   ├── src/
│   │   ├── public/           # PWA manifest, service worker, shield icon
│   │   └── vite.config.ts
│   ├── desktop/              # Windows Desktop App (Electron 29, CSP, Sandboxed links, electron-builder)
│   │   ├── src/              # Main process, preload script, offline fallback
│   │   ├── assets/           # Multi-size icon.ico and icon.png
│   │   ├── web-dist/         # Bundled standalone web client
│   │   └── dist-win/         # Generated Windows NSIS installer & portable exe
│   └── android/              # Native Android App (React Native, Expo SDK 51, SecureStore)
│       ├── src/              # Screens, context, secure storage client, navigation
│       ├── assets/           # Adaptive icon.png
│       ├── eas.json          # EAS build configuration (preview APK / production AAB)
│       └── app.json          # Android minimal permissions config
├── scripts/                  # Automated PowerShell management scripts
│   ├── start-backend.ps1     # Starts FastAPI backend on port 8000
│   ├── start-web.ps1         # Starts Vite dev server on port 5173
│   ├── run-tests.ps1         # Runs complete backend pytest (25) & web vitest (5) suites
│   └── build-all.ps1         # Master production build automation for all platforms
├── docker-compose.yml        # Multi-container orchestration (FastAPI + PostgreSQL)
└── README.md
```

---

## 3. Prerequisites

- **Python 3.11+** (Tested on Python 3.14 on Windows)
- **Node.js 18+** (Tested on Node v24) and **npm**
- **Git**
- Optional: **Docker Desktop** (for containerized PostgreSQL deployment)

---

## 4. Quick Start (Windows PowerShell)

All commands below are designed to be executed directly from Windows PowerShell in the root project directory:

### 1. Install Dependencies

#### Backend:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..
```

#### Shared Packages & Web App:
```powershell
cd packages\shared-types
npm install
npm run build
cd ..\api-client
npm install
npm run build
cd ..\..\apps\web
npm install
cd ..\..
```

#### Desktop & Android Clients:
```powershell
cd apps\desktop
npm install
cd ..\android
npm install
cd ..\..
```

---

### 2. Start the Backend API Server

```powershell
.\scripts\start-backend.ps1
```
* Or manually via PowerShell:
```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is running at `http://127.0.0.1:8000`.
- **Interactive Swagger Documentation:** `http://127.0.0.1:8000/docs`
- **Alternative ReDoc UI:** `http://127.0.0.1:8000/redoc`

---

### 3. Start the Web App & PWA

Open a second PowerShell terminal:
```powershell
.\scripts\start-web.ps1
```
* Or manually:
```powershell
cd apps\web
npm run dev
```
Open `http://localhost:5173` in your browser. The Vite dev server automatically proxies `/api` requests to `http://127.0.0.1:8000`.

---

### 4. Run Automated Test Suites

To execute the combined test suites (25 Backend Pytest tests + 5 Frontend Vitest tests):
```powershell
.\scripts\run-tests.ps1
```

* Or run backend tests individually:
```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest app\tests -v
```

* Or run frontend unit tests individually:
```powershell
cd apps\web
npm run test
```

---

### 5. Run Full Master Build Automation

To build all production artifacts across the entire monorepo in one command:
```powershell
.\scripts\build-all.ps1
```
This PowerShell script automatically:
1. Compiles `@truetrace/shared-types` and `@truetrace/api-client`.
2. Builds the production Web PWA bundle in `apps/web/dist`.
3. Synchronizes web assets to `apps/desktop/web-dist` and packages the **Windows NSIS Installer** and **Portable Executable** in `apps/desktop/dist-win/`.
4. Bundles the Android React Native app with Metro & Hermes bytecode in `apps/android/dist`.
5. Validates the complete backend test suite.

---

## 5. Environment Variables Configuration

Copy `backend/.env.example` to `backend/.env`:
```env
PROJECT_NAME="TrueTrace AI"
VERSION="1.0.0"
SECRET_KEY="replace-with-a-secure-random-32-character-secret-in-production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Configuration (Default: SQLite; for production configure PostgreSQL)
DATABASE_URL="sqlite:///./truetrace.db"
# DATABASE_URL="postgresql://truetrace:supersecret@localhost:5432/truetrace_db"

# Optional External Intelligence Integrations (Leave empty for graceful mock fallback)
HIBP_API_KEY=""
VIRUSTOTAL_API_KEY=""
OPENAI_API_KEY=""
GEMINI_API_KEY=""

# Optional Meta Graph API Integration (Requires Meta App Review for live profile data)
META_APP_ID=""
META_APP_SECRET=""
META_ACCESS_TOKEN=""

# DNS Resolution
DNS_TIMEOUT_SECONDS=3.0
RATE_LIMIT_PER_MINUTE=60
```

---

## 6. Social Media Integrations & Meta Platform Requirements

TrueTrace AI uses a multi-tiered architecture for social risk assessment:

### Current Operational Capabilities (No API Keys Required)
- **Instagram**: Public handle syntax normalization, authority spoofing heuristics (e.g. `meta_support`, `official_service`), burner/bot random trailing digits detection, and community fraud registry cross-referencing.
- **Facebook**: Typo-squatting and phishing domain validation (detecting fake security alert URLs), path impersonation pattern heuristics, and community complaint lookup.
- **Ethical Boundary**: Private direct messages, hidden phone numbers, passwords, and follower graphs are never probed or scraped.

### Requirements for Live Meta Graph API Queries
To upgrade from public heuristic queries to live Meta Graph API telemetry, the following Meta developer products and credentials are required:

1. **Meta Developer Account & App Creation**:
   - Create a developer account on [developers.facebook.com](https://developers.facebook.com).
   - Create an app of type **Business**.
2. **Permissions Required for App Review**:
   - `instagram_basic`: To read public Instagram business account profiles and media.
   - `pages_read_engagement`: To assess verified Facebook Page engagement metrics and legitimacy.
   - `pages_read_user_content`: To analyze page posts for fraud pretexts.
   - `business_management`: For business identity verification.
3. **Business Verification**:
   - Meta requires formal business verification (corporate registration, utility bills, and proof of domain ownership).
   - Personal consumer profiles (`facebook.com/username` or private `@instagram` handles) cannot be inspected through Graph API without the profile owner logging in.
4. **Configuration**:
   - Populate `META_APP_ID`, `META_APP_SECRET`, and `META_ACCESS_TOKEN` in `backend/.env`.

---

## 7. Windows Desktop Application Setup & Packaging

The desktop application wraps TrueTrace AI in a hardened Electron shell:
- **Strict Content Security Policy** (`default-src 'self' ...`).
- **Context Isolation** (`contextIsolation: true`) and **No Node Integration in Renderer** (`nodeIntegration: false`).
- **External Link Sandboxing**: External links are intercepted and delegated exclusively to the operating system's default browser.
- **Embedded Web Client**: Packages the production web client in `web-dist` so the app is immediately usable offline.
- **Offline Fallback Page**: Honest diagnostic recovery screen if the backend server is unreachable.

### Development Mode
```powershell
cd apps\desktop
npm run dev
```

### Packaging Windows Installer (`.exe`)
```powershell
cd apps\desktop
npm run dist:win
```
Outputs generated in `apps/desktop/dist-win/`:
- `TrueTrace AI Setup 1.0.0.exe`: Installable Windows NSIS setup package.
- `TrueTrace AI 1.0.0.exe`: Standalone portable executable.
- `win-unpacked/TrueTrace AI.exe`: Unpacked application directory.

---

---

## 8. Native Android App (React Native & Expo SDK 51)

TrueTrace AI includes a native Android client featuring hardware-backed credential storage (`expo-secure-store`), live signal telemetry (RFC 5322 DNS/MX and ITU-T E.164 VoIP line classification), full scan history, report sharing, and dynamic backend IP configuration for emulator and physical device testing.

### A. Quick Start with PowerShell
```powershell
# From the TrueTrace AI root directory:
.\scripts\start-android.ps1
```
* Or manually:
```powershell
cd apps\android
npm install
npx expo start
```
- Press **`a`** in the terminal to launch directly on an active **Android Studio Emulator**.
- Or scan the displayed QR code with the **Expo Go** application on a **physical Android phone** connected to the same Wi-Fi network.

### B. Configuring Backend Host for Android Testing
Android devices handle network loopbacks differently from desktop browsers:
1. **Android Studio Emulator**:
   - The emulator routes host localhost to `http://10.0.2.2:8000`.
   - The app automatically defaults to `http://10.0.2.2:8000` when running in the emulator.
2. **Physical Android Devices (over Wi-Fi)**:
   - Physical phones cannot access `localhost` or `10.0.2.2`.
   - The app dynamically derives your host machine's Wi-Fi LAN IP (e.g. `http://10.114.199.78:8000`) from the Metro packager.
   - You can also navigate to **Settings & Network** (`⚙️`) in the app at any time to test backend health, view round-trip latency, and enter any custom server IP.

### C. Local Production Hermes Bytecode Export
To compile all screens and assets into Hermes optimized bytecode locally:
```powershell
cd apps\android
npx expo export -p android
```
The compiled Hermes bundle (`*.hbc`) and static assets are exported to `apps/android/dist/`.

### D. Generating Standalone Release APK via EAS Build
The project includes a ready-to-use `apps/android/eas.json` with a `preview` profile configured for standalone APK output:

1. **Prerequisites**:
   - Free account on [Expo Application Services (EAS)](https://expo.dev/signup).
   - Global EAS CLI installed:
     ```powershell
     npm install -g eas-cli
     ```
2. **Login & Project Linking**:
   ```powershell
   eas login
   cd apps\android
   eas project:init
   ```
3. **Trigger Standalone APK Build**:
   ```powershell
   eas build -p android --profile preview
   ```
   EAS will compile the native Android Gradle project in the cloud and provide a direct download link and QR code for the standalone `.apk` installer.
4. **Production Google Play Store Bundle (.aab)**:
   ```powershell
   eas build -p android --profile production
   ```

---

## 9. Automated Testing Results

**30 automated tests pass with 100% success rate:**

### Backend Pytest Suite (25 Tests)
- `test_register_and_login`: Verified password hashing, duplicate email rejection, JWT creation.
- `test_email_masking`: Verified RFC email privacy masking.
- `test_email_analyzer_invalid_syntax`: Verified syntax error catching.
- `test_email_analyzer_disposable_domain`: Verified throwaway domain blocklist detection.
- `test_email_analyzer_legit_domain`: Verified normal domain non-penalization.
- `test_phone_masking`: Verified E.164 phone privacy masking.
- `test_phone_analyzer_valid_number`: Verified ITU-T valid number identification.
- `test_phone_analyzer_invalid_syntax`: Verified invalid number syntax catching.
- `test_phone_analyzer_honest_limitation`: Verified honest limitation disclosure.
- `test_risk_engine_deduplication`: Verified duplicate indicators are not double-penalized.
- `test_risk_engine_unavailable_checks_not_penalized`: Verified missing APIs do not lower score.
- `test_risk_engine_all_unavailable_is_inconclusive`: Verified missing evidence leads to `INCONCLUSIVE`.
- `test_instagram_username_extraction`: Verified handle normalization from URLs and mentions.
- `test_instagram_spoofing_keywords`: Verified authority impersonation pattern matching.
- `test_facebook_domain_validation`: Verified typo-squatting detection.
- `test_validate_email_valid_syntax`: Verified standalone email syntax validation.
- `test_validate_email_disposable`: Verified disposable inbox provider detection.
- `test_validate_email_invalid_syntax`: Verified invalid email rejection.
- `test_validate_email_impersonation_keywords`: Verified phishing keyword detection in local part.
- `test_validate_phone_valid`: Verified ITU-T standard phone validation.
- `test_validate_phone_with_default_region`: Verified default country code fallback parsing.
- `test_validate_phone_invalid_syntax`: Verified invalid phone pattern rejection.
- `test_validate_email_api_endpoint`: Verified `POST /api/v1/validate/email` response contract.
- `test_validate_phone_api_endpoint`: Verified `POST /api/v1/validate/phone` response contract.
- `test_full_scan_lifecycle`: Verified Email scan -> JSON export -> ReportLab PDF export -> Dashboard stats computation -> Anonymous report sharing via token -> Revocation -> Deletion.

### Frontend Vitest Suite (5 Tests)
- `manages auth tokens in localStorage correctly`: Verified secure token persistence and clear methods.
- `formats export PDF and JSON download URLs correctly`: Verified tamper-evident export URLs.
- `sends correct payload for validateEmail`: Verified API client email validation contract.
- `sends correct payload for validatePhone`: Verified API client telephony validation contract.
- `handles API errors gracefully`: Verified structured error response propagation.

---

## 10. Security & Ethical Boundaries

| Feature | TrueTrace AI Policy |
| :--- | :--- |
| **Private Account Probing** | **Strictly Prohibited.** We never attempt to discover passwords, private DMs, or hidden phone numbers. |
| **New Account Detection** | **Ethical Heuristic.** An account is never labeled fake merely because it is recently created or has few followers. |
| **DNS / MX Failures** | Authoritative lookup failures are clearly flagged as network timeouts or configuration anomalies without fabricating certainty. |
| **Rate Limiting** | Automated sliding-window rate limiting prevents denial-of-service abuse. |
| **Masking** | All reports, exports, and shared URLs automatically mask identifiers (e.g. `j***e@domain.com`, `+1 *** *** 2671`). |

---

## 11. License

MIT License. Designed and engineered for cyber defense and digital identity safety.
