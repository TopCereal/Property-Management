"""
Seed script for Backend DB. Run with the backend virtual environment activated:

    Set-Location -LiteralPath 'C:\Users\Taylor\Property-Management\Backend'
    .\.venv\Scripts\Activate.ps1
    python seed.py

This script will insert minimal sample properties and tenants if they don't exist.
"""
from app.database import SessionLocal
from app import models
from sqlalchemy.exc import IntegrityError

sample_properties = [
    {"address": "100 Test Ave", "bedrooms": 2, "bathrooms": 1.5, "area": 800, "rent_amount": 900.00, "status": "vacant"},
    {"address": "200 Sample Rd", "bedrooms": 3, "bathrooms": 2.0, "area": 1200, "rent_amount": 1400.00, "status": "rented"},
]

sample_tenants = [
    {"first_name": "Test", "last_name": "User", "email": "test.user+seed@example.com", "phone": "555-0001", "status": "active"},
    {"first_name": "Alice", "last_name": "Example", "email": "alice.example+seed@example.com", "phone": "555-0002", "status": "active"},
]


def main():
    db = SessionLocal()
    try:
        # Create properties
        for p in sample_properties:
            exists = db.query(models.Property).filter(models.Property.address == p['address']).first()
            if not exists:
                prop = models.Property(
                    address=p['address'],
                    bedrooms=p['bedrooms'],
                    bathrooms=p['bathrooms'],
                    area=p['area'],
                    rent_amount=p['rent_amount'],
                    status=p['status']
                )
                db.add(prop)
        db.commit()

        # Create tenants
        for t in sample_tenants:
            exists = db.query(models.Tenant).filter(models.Tenant.email == t['email']).first()
            if not exists:
                tenant = models.Tenant(
                    first_name=t['first_name'],
                    last_name=t['last_name'],
                    email=t['email'],
                    phone=t['phone'],
                    status=t['status']
                )
                db.add(tenant)
        db.commit()

        print("Seed complete")
    except IntegrityError as ie:
        db.rollback()
        print("Integrity error during seeding:", ie)
    except Exception as e:
        db.rollback()
        print("Error during seeding:", e)
    finally:
        db.close()


if __name__ == '__main__':
    main()
