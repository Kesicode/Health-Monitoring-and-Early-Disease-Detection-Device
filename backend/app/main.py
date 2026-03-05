from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
import app.models  # noqa: F401 — ensure all models are imported before create_all

from app.routers import auth, users, animals, devices, health, alerts, websocket
from app.routers.admin import (
    users as admin_users,
    animals as admin_animals,
    devices as admin_devices,
    alerts as admin_alerts,
    stats as admin_stats,
    settings as admin_settings,
    health_data as admin_health_data,
)


def create_tables():
    Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Agri Guard API",
    description="Livestock health monitoring system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_tables()


# Public + farmer routes
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(animals.router)
app.include_router(devices.router)
app.include_router(health.router)
app.include_router(alerts.router)
app.include_router(websocket.router)

# Admin routes
app.include_router(admin_users.router)
app.include_router(admin_animals.router)
app.include_router(admin_devices.router)
app.include_router(admin_alerts.router)
app.include_router(admin_stats.router)
app.include_router(admin_settings.router)
app.include_router(admin_health_data.router)


@app.get("/health-check")
def health_check():
    return {"status": "ok"}
