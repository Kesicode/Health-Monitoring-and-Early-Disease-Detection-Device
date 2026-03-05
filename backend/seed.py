"""
Seed script — creates admin + farmer accounts and sample data.
Run: docker exec agri_guard_backend python seed.py
"""
import os, sys
sys.path.insert(0, "/app")

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User
from app.models.animal import Animal
from app.models.device import Device
from app.models.alert_threshold import AlertThreshold
import app.models  # ensure all tables exist  # noqa: F401

Base.metadata.create_all(bind=engine)

def seed():
    db: Session = SessionLocal()
    try:
        # ── Admin user ──────────────────────────────────────────────────────
        if not db.query(User).filter(User.email == "admin@agriguard.com").first():
            db.add(User(
                name="Admin",
                email="admin@agriguard.com",
                hashed_password=hash_password("Admin@1234"),
                role="admin",
                phone="+91-9000000001",
                is_active=True,
            ))
            print("✓ Admin user created  →  admin@agriguard.com  /  Admin@1234")
        else:
            print("  Admin user already exists")

        # ── Farmer user ─────────────────────────────────────────────────────
        farmer = db.query(User).filter(User.email == "farmer@agriguard.com").first()
        if not farmer:
            farmer = User(
                name="Ravi Kumar",
                email="farmer@agriguard.com",
                hashed_password=hash_password("Farmer@1234"),
                role="farmer",
                phone="+91-9000000002",
                is_active=True,
            )
            db.add(farmer)
            db.flush()
            print("✓ Farmer user created  →  farmer@agriguard.com  /  Farmer@1234")
        else:
            print("  Farmer user already exists")

        db.commit()
        db.refresh(farmer)

        # ── Sample device ────────────────────────────────────────────────────
        if not db.query(Device).filter(Device.serial_number == "DEV-DEMO-001").first():
            device = Device(
                serial_number="DEV-DEMO-001",
                device_type="collar",
                firmware_version="1.0.0",
                is_active=True,
                is_claimed=True,
                owner_id=farmer.id,
            )
            db.add(device)
            db.flush()
            print("✓ Sample device created  (DEV-DEMO-001)")
        else:
            device = db.query(Device).filter(Device.serial_number == "DEV-DEMO-001").first()
            print("  Sample device already exists")

        # ── Sample animal ────────────────────────────────────────────────────
        if not db.query(Animal).filter(Animal.tag_number == "TAG-001").first():
            animal = Animal(
                name="Lakshmi",
                animal_type="cow",
                breed="Holstein Friesian",
                age_months=36,
                weight_kg=450.0,
                gender="female",
                tag_number="TAG-001",
                notes="Primary dairy cow",
                owner_id=farmer.id,
            )
            db.add(animal)
            db.flush()
            # Link device to animal
            device.animal_id = animal.id
            print("✓ Sample animal created  (Lakshmi - cow)")
        else:
            print("  Sample animal already exists")

        # ── Default alert thresholds ─────────────────────────────────────────
        defaults = [
            ("cow",     38.0, 39.5, 40, 80, 0.0, 3.0),
            ("goat",    38.5, 40.5, 60, 120, 0.0, 3.0),
            ("chicken", 40.0, 43.0, 200, 400, 0.0, 2.0),
            ("pig",     38.0, 40.0, 55, 120, 0.0, 3.0),
            ("dog",     37.5, 40.0, 60, 140, 95.0, 2.0),
        ]
        for row in defaults:
            atype = row[0]
            if not db.query(AlertThreshold).filter(AlertThreshold.animal_type == atype).first():
                db.add(AlertThreshold(
                    animal_type=atype,
                    temp_min=row[1], temp_max=row[2],
                    hr_min=row[3], hr_max=row[4],
                    spo2_min=row[5],
                    activity_min=row[6],
                ))
        print("✓ Alert thresholds seeded")

        db.commit()
        print("\n✅ Seed complete!")
        print("\n┌──────────────────────────────────────────────────────┐")
        print("│  LOGIN CREDENTIALS                                   │")
        print("├──────────────────────────────────────────────────────┤")
        print("│  Admin   →  admin@agriguard.com   /  Admin@1234      │")
        print("│  Farmer  →  farmer@agriguard.com  /  Farmer@1234     │")
        print("└──────────────────────────────────────────────────────┘")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
