# Plan: Agri Guard — Livestock Health Monitoring System

## Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Recharts, Zod, react-hook-form
- **Backend**: FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, python-jose, passlib, qrcode
- **Database**: PostgreSQL (Docker)
- **Real-time**: WebSocket (FastAPI ConnectionManager + browser native WS)
- **Auth**: JWT (access + refresh tokens), device auth via `X-Device-Serial` header
- **Roles**: Admin, Farmer
- **IoT**: Real hardware POSTs to `/health-data` with `X-Device-Serial` header

---

## Project Structure

```
whoop-animal/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py              ← pydantic-settings (env vars)
│   │   │   ├── database.py            ← SQLAlchemy engine + session
│   │   │   ├── security.py            ← JWT create/verify, bcrypt hashing
│   │   │   └── dependencies.py        ← get_db, get_current_user, require_admin, require_farmer, get_device
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── animal.py
│   │   │   ├── device.py
│   │   │   ├── health_reading.py
│   │   │   ├── alert.py
│   │   │   └── alert_threshold.py     ← configurable per animal_type × metric
│   │   ├── schemas/
│   │   │   ├── user.py                ← UserCreate, UserUpdate, UserResponse, Token
│   │   │   ├── animal.py              ← AnimalCreate, AnimalUpdate, AnimalResponse
│   │   │   ├── device.py              ← DeviceCreate, DeviceUpdate, DeviceResponse
│   │   │   ├── health.py              ← HealthReadingCreate, HealthReadingResponse, HealthStats
│   │   │   ├── alert.py               ← AlertResponse, AlertResolve
│   │   │   └── settings.py            ← ThresholdUpdate
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── animals.py
│   │   │   ├── devices.py
│   │   │   ├── health.py
│   │   │   ├── alerts.py
│   │   │   ├── websocket.py
│   │   │   └── admin/
│   │   │       ├── users.py
│   │   │       ├── animals.py
│   │   │       ├── devices.py
│   │   │       ├── alerts.py
│   │   │       ├── health_data.py
│   │   │       ├── stats.py
│   │   │       └── settings.py
│   │   └── services/
│   │       ├── alert_service.py       ← threshold check → create alerts → push WS
│   │       ├── ws_manager.py          ← ConnectionManager: per-animal room + per-user room
│   │       └── qr_service.py          ← generate QR PNG as base64, decode QR
│   ├── alembic/
│   ├── requirements.txt
│   ├── docker-compose.yml
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx               ← / landing
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── explore/page.tsx       ← public about-device page
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── layout.tsx         ← admin sidebar + navbar
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── users/
│   │   │       │   ├── page.tsx       ← user list
│   │   │       │   ├── create/page.tsx
│   │   │       │   └── [id]/page.tsx
│   │   │       ├── animals/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/page.tsx
│   │   │       ├── devices/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── register/page.tsx
│   │   │       │   └── [id]/page.tsx
│   │   │       ├── alerts/page.tsx
│   │   │       ├── health-data/page.tsx
│   │   │       └── settings/page.tsx
│   │   └── (farmer)/
│   │       └── dashboard/
│   │           ├── layout.tsx         ← farmer sidebar + navbar
│   │           ├── page.tsx           ← farmer home dashboard
│   │           ├── animals/
│   │           │   ├── page.tsx
│   │           │   ├── register/page.tsx
│   │           │   └── [id]/
│   │           │       ├── page.tsx
│   │           │       └── edit/page.tsx
│   │           ├── devices/
│   │           │   ├── page.tsx
│   │           │   └── [id]/page.tsx
│   │           ├── scan/page.tsx
│   │           ├── explore/
│   │           │   ├── page.tsx
│   │           │   └── devices/[type]/page.tsx
│   │           └── alerts/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── AlertBanner.tsx        ← slides in on WS alert
│   │   │   ├── PageHeader.tsx
│   │   │   └── DiagonalSplitLayout.tsx
│   │   ├── ui/
│   │   │   ├── MetricTile.tsx         ← single value tile + trend arrow
│   │   │   ├── StatCard.tsx           ← summary number card
│   │   │   ├── StatusBadge.tsx        ← Online/Offline/Warning/Critical
│   │   │   ├── SeverityBadge.tsx      ← Info/Warning/Critical color badge
│   │   │   ├── DataTable.tsx          ← sortable/filterable reusable table
│   │   │   ├── Pagination.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSkeleton.tsx
│   │   ├── animals/
│   │   │   ├── AnimalCard.tsx
│   │   │   ├── AnimalTypeBadge.tsx
│   │   │   ├── AnimalTypeSelector.tsx
│   │   │   ├── HealthMetricsPanel.tsx
│   │   │   ├── AnimalHealthStatus.tsx
│   │   │   ├── AnimalRegisterStepper.tsx
│   │   │   └── QRCodeDisplay.tsx
│   │   ├── charts/
│   │   │   └── HealthChart.tsx        ← Recharts multi-line, toggleable metrics
│   │   ├── devices/
│   │   │   ├── DeviceCard.tsx
│   │   │   └── DeviceSetupGuide.tsx
│   │   └── alerts/
│   │       ├── AlertCard.tsx
│   │       └── AlertFilterBar.tsx
│   ├── lib/
│   │   ├── api.ts                     ← typed fetch wrapper, auto-attach JWT, 401 refresh
│   │   ├── useHealthWS.ts             ← WS hook: connect, stream readings, reconnect
│   │   ├── useAlerts.ts               ← alert count polling + WS push
│   │   ├── auth.ts                    ← store/retrieve JWT, decode payload, check expiry
│   │   ├── constants.ts               ← ANIMAL_TYPES, labels, icons, colors
│   │   ├── validations.ts             ← zod schemas for all forms
│   │   └── utils.ts                   ← formatTemp, formatDate, getHealthStatus
│   └── middleware.ts                  ← role-based route protection
├── plan.md
└── README.md
```

---

## Database Models

| Model | Fields |
|---|---|
| **users** | id, email, password_hash, full_name, role (`admin`/`farmer`), is_active, created_at, updated_at |
| **animals** | id, name, animal_type (`cow`/`chicken`/`goat`/`pig`/`dog`), breed, age_months, weight_kg, tag_number, notes, image_url, qr_code (uuid), farmer_id → users, device_id → devices (nullable), created_at |
| **devices** | id, device_serial (unique), device_type (`collar`/`ear_tag`/`ankle_band`), firmware_version, status (`online`/`offline`/`unassigned`), last_seen, battery_pct, notes, created_at |
| **health_readings** | id, animal_id → animals, temperature (float), heart_rate (int), activity_level (float 0–100), rumination_score (float 0–100), raw_payload (JSON), timestamp |
| **alerts** | id, animal_id → animals, alert_type (`fever`/`inactivity`/`low_rumination`/`heart_rate`/`device_offline`), message, severity (`info`/`warning`/`critical`), is_resolved, resolved_at, created_at |
| **alert_thresholds** | id, animal_type, metric, warn_min, warn_max, critical_min, critical_max |

---

## Backend — All API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create farmer account |
| POST | `/auth/login` | Returns access + refresh tokens |
| POST | `/auth/refresh` | New access token from refresh token |
| POST | `/auth/logout` | Invalidate refresh token |

### Current User
| Method | Path | Description |
|---|---|---|
| GET | `/users/me` | Own profile |
| PATCH | `/users/me` | Update name / password |

### Farmer — Animals
| Method | Path | Description |
|---|---|---|
| GET | `/animals` | Farmer's animals (paginated, filter by type, search) |
| POST | `/animals` | Register new animal → generates QR UUID |
| GET | `/animals/{id}` | Animal detail |
| PUT | `/animals/{id}` | Update animal info |
| DELETE | `/animals/{id}` | Delete animal |
| GET | `/animals/{id}/qr` | Returns QR code PNG (base64) |
| GET | `/animals/by-qr/{qr_code}` | Lookup by scanned QR UUID |

### Farmer — Devices
| Method | Path | Description |
|---|---|---|
| GET | `/devices` | Farmer's devices |
| POST | `/devices` | Claim a device by serial number |
| GET | `/devices/{id}` | Device detail |
| PUT | `/devices/{id}` | Update name/notes |
| POST | `/devices/{id}/assign/{animal_id}` | Assign to an animal |
| POST | `/devices/{id}/unassign` | Unassign from animal |

### Health Data (IoT → Server)
| Method | Path | Description |
|---|---|---|
| POST | `/health-data` | Device pushes reading. Auth: `X-Device-Serial` header. Triggers alert check + WS push |

### Farmer — Health History
| Method | Path | Description |
|---|---|---|
| GET | `/animals/{id}/health` | Paginated readings (params: from, to, resolution: raw/hourly/daily) |
| GET | `/animals/{id}/health/latest` | Single most recent reading |
| GET | `/animals/{id}/health/stats` | Min/max/avg for a period |

### Farmer — Alerts
| Method | Path | Description |
|---|---|---|
| GET | `/alerts` | Farmer's alerts (filter: is_resolved, severity, type, animal_id) |
| GET | `/alerts/count` | Unresolved count (notification badge) |
| PUT | `/alerts/{id}/resolve` | Resolve one alert |
| PUT | `/alerts/resolve-all` | Bulk resolve all open alerts |

### WebSocket
| Path | Description |
|---|---|
| `WS /ws/health/{animal_id}` | Streams live health readings for one animal |
| `WS /ws/alerts/{user_id}` | Streams new alerts for a farmer's animals |

### Admin — Stats
| Method | Path | Description |
|---|---|---|
| GET | `/admin/stats` | Total users, animals, devices online, alerts today, readings today |

### Admin — Users
| Method | Path | Description |
|---|---|---|
| GET | `/admin/users` | All users (paginated, search, filter by role/status) |
| POST | `/admin/users` | Create user (any role) |
| GET | `/admin/users/{id}` | User detail + their animals |
| PATCH | `/admin/users/{id}` | Update role / status / info |
| DELETE | `/admin/users/{id}` | Delete user |
| POST | `/admin/users/{id}/toggle-active` | Ban / unban |

### Admin — Animals
| Method | Path | Description |
|---|---|---|
| GET | `/admin/animals` | All animals (filter by type, farmer, health status) |
| GET | `/admin/animals/{id}` | Read-only detail (any farmer's animal) |
| DELETE | `/admin/animals/{id}` | Force delete |

### Admin — Devices
| Method | Path | Description |
|---|---|---|
| GET | `/admin/devices` | All devices (filter by status, type) |
| POST | `/admin/devices/register` | Add new device to system |
| GET | `/admin/devices/{id}` | Device detail |
| PATCH | `/admin/devices/{id}` | Update firmware/notes |
| DELETE | `/admin/devices/{id}` | Remove device |

### Admin — Alerts
| Method | Path | Description |
|---|---|---|
| GET | `/admin/alerts` | All alerts (filter by severity, type, resolved, date range) |
| PUT | `/admin/alerts/{id}/resolve` | Resolve alert |
| DELETE | `/admin/alerts/{id}` | Delete alert record |

### Admin — Health Data
| Method | Path | Description |
|---|---|---|
| GET | `/admin/health-data` | Browse all raw readings (filter by animal, date range) |
| GET | `/admin/health-data/export` | Export readings as CSV |
| DELETE | `/admin/health-data/{id}` | Delete a reading |

### Admin — Settings
| Method | Path | Description |
|---|---|---|
| GET | `/admin/settings/thresholds` | Get all thresholds per animal type per metric |
| PUT | `/admin/settings/thresholds` | Update threshold values |

---

## Frontend — All Pages

### Public

**`/` — Landing Page**
- Top bar: "Agri Guard" logo left, Login + Register buttons right
- Hero: title "Life Stock Health Monitoring System", subtext, Get Started CTA
- Diagonal line decoration (matching wireframe style)
- Features strip: 4 cards — Real-time Monitoring, Temperature, Rumination, Activity
- Footer

**`/login` — Login**
- `DiagonalSplitLayout`: left = brand panel (logo, tagline), right = form
- Fields: Email, Password. Error toast on bad credentials.
- "Don't have an account? Register" link

**`/register` — Register**
- Same `DiagonalSplitLayout`
- Fields: Full Name, Email, Password, Confirm Password
- Farmer role auto-assigned on success → redirect to `/dashboard`

---

### Admin Pages (`/admin/*`)

**`/admin/dashboard`**
- 4 StatCard tiles: Total Farmers, Total Animals, Devices Online, Open Alerts
- Recent Activity feed: latest registrations + alerts
- Quick-nav shortcut cards to Users / Animals / Devices / Alerts

**`/admin/users`**
- SearchBar + Role filter + Status filter
- DataTable: Name, Email, Role badge, Animals count, Joined, Status, Actions
- "Create User" button

**`/admin/users/create`**
- Form: Full Name, Email, Password (auto-generate toggle), Role dropdown

**`/admin/users/[id]`**
- Header: avatar (initials), name, email, role, status
- Tabs: Animals tab (their animals table), Alerts tab (recent alerts)
- Actions: Edit Role, Ban/Unban, Delete

**`/admin/animals`**
- Filters: Type tabs + Farmer dropdown + Health status filter
- DataTable: Name, Type badge, Farmer, Device status, Last reading, Health status

**`/admin/animals/[id]`**
- Read-only animal detail — same layout as farmer view
- Admin action: force delete

**`/admin/devices`**
- DataTable: Serial#, Device Type, Assigned Animal, Farmer, Status, Last Seen, Firmware
- Filters: Status + Device Type
- "Register Device" button

**`/admin/devices/register`**
- Form: Serial Number, Device Type (Collar/Ear Tag/Ankle Band), Firmware Version, Notes

**`/admin/devices/[id]`**
- Serial, type, firmware, status, battery, last seen
- Assigned animal card or "Unassigned"
- Edit / Delete / Unassign

**`/admin/alerts`**
- Stats bar: Critical open / Warning open / Resolved today
- Filters: Severity, Type, Status, date range picker
- DataTable: Animal, Farmer, Type, Message, Severity badge, Time, Status, Resolve
- Bulk Resolve button

**`/admin/health-data`**
- Animal search-select + date range picker
- DataTable: Timestamp, Temp, HR, Activity, Rumination, Raw payload toggle
- Export CSV button

**`/admin/settings`**
- Threshold table: rows = animal types, columns = metrics
- Inline editable cells (warn range + critical)
- Save All + Reset to defaults

---

### Farmer Pages (`/dashboard/*`)

**`/dashboard`**
- Greeting "Good morning, {name}"
- 4 StatCards: My Animals, Devices Online, Open Alerts, Critical Alerts
- "+ Register Animal" CTA button
- Animal grid: AnimalCard × all animals (responsive)
- Recent Alerts strip: last 5, with Resolve buttons

**`/dashboard/animals`**
- SearchBar + animal type filter tabs: All / Cow / Chicken / Goat / Pig / Dog (count per tab)
- Sort: Name A–Z / Health Status / Recent Activity
- Animal cards grid, LoadingSkeleton on load
- EmptyState if no animals

**`/dashboard/animals/register` (4 steps)**
- Step 1 — Choose Type: 5 large visual buttons with icons/illustrations
- Step 2 — Details: Name*, Breed, Age (months), Weight (kg), Tag Number, Notes, Upload Photo
- Step 3 — Assign Device: list of unassigned devices, "Skip for now"
- Step 4 — Confirm: summary card → Register → navigate to animal detail

**`/dashboard/animals/[id]`**
- Header: photo, name, type badge, breed, tag#, device status
- AnimalHealthStatus indicator (Healthy / Warning / Critical)
- Live Health Panel (WebSocket):
  - 4 MetricTiles: Temperature, Heart Rate, Activity Level, Rumination Score
  - Each: current value, trend arrow, color by severity
- HealthChart: Recharts LineChart, toggleable metrics, time range 1h/6h/24h/7d
- Stats row: Min / Max / Avg for selected period
- Active Alerts section: alert cards with resolve buttons
- QR Code section: QR image, Download PNG, Print
- Edit / Delete animal buttons

**`/dashboard/animals/[id]/edit`**
- Pre-filled form with all Step 2 fields + device change

**`/dashboard/devices`**
- DeviceCard grid: serial#, type, assigned animal, status, last seen, battery %
- "Claim Device" button → modal (serial input + animal assign dropdown)
- EmptyState if no devices

**`/dashboard/devices/[id]`**
- Serial, type, firmware, status, battery, last seen
- Assigned animal card (or "Not Assigned")
- DeviceSetupGuide accordion (per animal type attachment instructions)
- Unassign + Delete buttons

**`/dashboard/scan`**
- Camera feed with QR targeting frame overlay
- On scan: lookup by QR UUID → redirect to animal detail
- Manual entry fallback: text input + Go button
- Recent scans list (last 5 in localStorage)

**`/dashboard/explore`**
- "How It Works" step-by-step overview
- Device Types: 3 cards — Collar, Ear Tag, Ankle Band (sensors, compatible animals, "Learn More")
- FAQ accordion

**`/dashboard/explore/devices/[type]`**
- Full page for that device type
- Sensor list, installation diagram, step-by-step guide
- Compatible animal types
- Troubleshooting accordion

**`/dashboard/alerts`**
- Tabs: All / Active / Resolved
- Filters: Severity, Type, Animal dropdown
- "Resolve All" bulk button
- AlertCard list: animal thumbnail, name, type icon, message, severity badge, time ago, Resolve
- Resolved section (collapsible)

---

## Alert Logic (Backend Service)

On every `POST /health-data`:
1. Load `alert_thresholds` for animal's type
2. Check temperature, heart_rate, activity_level, rumination_score against thresholds
3. Determine severity: `normal → warning → critical`
4. Create `alerts` record if threshold exceeded
5. Push reading via WS to `/ws/health/{animal_id}` subscribers
6. Push new alert via WS to `/ws/alerts/{user_id}` of the animal's farmer

Background task (every 5 min): devices with `last_seen` > 15 min → create `device_offline` alert if not already open

### Default Thresholds

| Animal | Temp Warn | Temp Critical | HR Warn | HR Critical |
|---|---|---|---|---|
| Cow | >39.2°C | >40.5°C | <50 or >90 bpm | <40 or >110 bpm |
| Chicken | >42.0°C | >43.5°C | <200 or >400 bpm | <180 or >450 bpm |
| Goat | >39.5°C | >41.0°C | <60 or >90 bpm | <50 or >110 bpm |
| Pig | >39.0°C | >40.5°C | <60 or >100 bpm | <50 or >120 bpm |
| Dog | >39.0°C | >40.5°C | <60 or >140 bpm | <50 or >160 bpm |

---

## Implementation Phases

### Phase 1 — Scaffolding (parallel)
1. Init `backend/` — FastAPI skeleton, `requirements.txt`, `docker-compose.yml`, `.env.example`
2. Init `frontend/` — Next.js 14, Tailwind, shadcn/ui, folder structure, `middleware.ts` stub

### Phase 2 — Backend Core
3. DB models + Alembic initial migration + seed `alert_thresholds`
4. Auth endpoints (register, login, refresh, logout) + JWT helpers
5. Animal CRUD + qr_service
6. Device CRUD + device auth dependency
7. Health data ingestion + `ws_manager` + `alert_service`
8. Background task: device offline detection
9. Admin routers (users, animals, devices, alerts, health-data, stats, settings)

### Phase 3 — Frontend Foundation (parallel after Phase 2 auth)
10. `DiagonalSplitLayout`, landing, login, register + JWT auth flow
11. `middleware.ts` protection, shared Sidebar + Navbar (admin + farmer variants)

### Phase 4 — Admin Frontend
12. Admin dashboard (stats + activity feed)
13. Admin users (list, create, detail)
14. Admin animals + devices pages
15. Admin alerts + health-data browser + settings/thresholds

### Phase 5 — Farmer Frontend (parallel with Phase 4)
16. Farmer home dashboard
17. Animals list + 4-step register stepper
18. Animal detail + `useHealthWS` + `HealthChart`
19. Devices list + claim modal + device detail
20. QR scanner page
21. Explore + device type pages
22. Alerts page + `AlertBanner` live notification

### Phase 6 — Polish
23. Loading skeletons, empty states, error boundaries
24. Responsive design (mobile sidebar drawer)
25. Toast notification system
26. README with setup + device integration docs

---

## Verification Checklist
- [ ] Device POSTs fever reading → alert created → WS pushes to farmer → `AlertBanner` slides in
- [ ] Admin bans farmer → their JWT rejected on next request
- [ ] QR scan → navigate to correct animal detail
- [ ] JWT expiry → auto-refresh → request retried transparently
- [ ] Admin edits threshold → new reading triggers updated threshold correctly
- [ ] Farmer A cannot access Farmer B's animal (403)
- [ ] Device offline >15 min → `device_offline` alert created
- [ ] Health chart time-range switch fetches correct aggregated data
