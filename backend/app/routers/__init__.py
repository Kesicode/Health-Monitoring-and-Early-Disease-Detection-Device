from app.routers import auth, users, animals, devices, health, alerts, websocket
from app.routers.admin import users as admin_users
from app.routers.admin import animals as admin_animals
from app.routers.admin import devices as admin_devices
from app.routers.admin import alerts as admin_alerts
from app.routers.admin import stats as admin_stats
from app.routers.admin import settings as admin_settings
from app.routers.admin import health_data as admin_health_data

__all__ = [
    "auth", "users", "animals", "devices", "health", "alerts", "websocket",
    "admin_users", "admin_animals", "admin_devices", "admin_alerts",
    "admin_stats", "admin_settings", "admin_health_data",
]
