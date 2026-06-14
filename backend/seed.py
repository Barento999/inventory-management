#!/usr/bin/env python3
"""
Seed script to populate the database with initial data
Run with: python seed.py
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add the app directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, init_db
from app.core.security import hash_password
from app.models import User, Category, Warehouse, Supplier, Customer, Product, Sale, Purchase, Quote
from app.seeds.seed_data import CATEGORIES, WAREHOUSES, PRODUCTS, SUPPLIERS, CUSTOMERS


def seed_users(db):
    """Add seed users"""
    print("\n👥 Seeding users...")
    
    users = [
        {
            "email": "admin@inventory.com",
            "name": "Admin User",
            "password_hash": hash_password("Admin@123"),
            "role": "admin",
        },
        {
            "email": "manager@inventory.com",
            "name": "Manager User",
            "password_hash": hash_password("Manager@123"),
            "role": "manager",
        },
        {
            "email": "user@inventory.com",
            "name": "Regular User",
            "password_hash": hash_password("User@123"),
            "role": "user",
        },
    ]
    
    for user_data in users:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            user = User(**user_data)
            db.add(user)
            print(f"  ✓ {user_data['email']} ({user_data['role']})")
    
    db.commit()
    return users


def seed_categories(db):
    """Add seed categories"""
    print("\n📦 Seeding categories...")
    
    for cat_data in CATEGORIES:
        existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if not existing:
            category = Category(name=cat_data["name"], description=cat_data["description"])
            db.add(category)
            print(f"  ✓ {cat_data['name']}")
    
    db.commit()


def seed_warehouses(db):
    """Add seed warehouses"""
    print("\n🏭 Seeding warehouses...")
    
    for i, wh_data in enumerate(WAREHOUSES):
        existing = db.query(Warehouse).filter(Warehouse.name == wh_data["name"]).first()
        if not existing:
            is_default = i == 0  # First one is default
            warehouse = Warehouse(
                name=wh_data["name"],
                location=wh_data["location"],
                is_default=is_default
            )
            db.add(warehouse)
            print(f"  ✓ {wh_data['name']}")
    
    db.commit()


def seed_suppliers(db):
    """Add seed suppliers"""
    print("\n🏢 Seeding suppliers...")
    
    for supp_data in SUPPLIERS:
        existing = db.query(Supplier).filter(Supplier.email == supp_data["email"]).first()
        if not existing:
            supplier = Supplier(
                name=supp_data["name"],
                email=supp_data["email"],
                phone=supp_data["phone"],
                address=supp_data["address"],
                contact_person=supp_data["contactPerson"],
            )
            db.add(supplier)
            print(f"  ✓ {supp_data['name']}")
    
    db.commit()


def seed_customers(db):
    """Add seed customers"""
    print("\n👥 Seeding customers...")
    
    for cust_data in CUSTOMERS:
        existing = db.query(Customer).filter(Customer.email == cust_data["email"]).first()
        if not existing:
            customer = Customer(
                name=cust_data["name"],
                email=cust_data["email"],
                phone=cust_data["phone"],
                address=cust_data["address"],
            )
            db.add(customer)
            print(f"  ✓ {cust_data['name']}")
    
    db.commit()


def seed_products(db):
    """Add seed products"""
    print("\n📱 Seeding products...")
    
    # Get default category and warehouse
    default_category = db.query(Category).filter(Category.name == "Electronics").first()
    if not default_category:
        default_category = db.query(Category).first()
    
    default_warehouse = db.query(Warehouse).filter(Warehouse.is_default == True).first()
    if not default_warehouse:
        default_warehouse = db.query(Warehouse).first()
    
    if not default_category or not default_warehouse:
        print("  ⚠ No default category or warehouse found, skipping products")
        return
    
    for prod_data in PRODUCTS:
        existing = db.query(Product).filter(Product.sku == prod_data["sku"]).first()
        if not existing:
            product = Product(
                name=prod_data["name"],
                sku=prod_data["sku"],
                barcode=prod_data["barcode"],
                category_id=default_category.id,
                price=prod_data["price"],
                cost=prod_data["cost"],
                stock=prod_data["stock"],
                reorder_level=prod_data["reorderLevel"],
                status=prod_data["status"],
                description=prod_data["description"],
                warehouse_id=default_warehouse.id,
            )
            db.add(product)
            print(f"  ✓ {prod_data['sku']}: {prod_data['name']}")
    
    db.commit()


def seed_sales(db):
    """Add seed sales transactions"""
    print("\n💰 Seeding sales...")
    
    customers = db.query(Customer).limit(5).all()
    user = db.query(User).first()
    
    if not customers or not user:
        print("  ⚠ No customers or users found, skipping sales")
        return
    
    for i, customer in enumerate(customers):
        total = round(random.uniform(100, 5000), 2)
        sale = Sale(
            customer_id=customer.id,
            total=total,
            status="completed",
            user_id=user.id,
        )
        db.add(sale)
        print(f"  ✓ Sale #{i+1}: ${total}")
    
    db.commit()


def seed_purchases(db):
    """Add seed purchase orders"""
    print("\n📦 Seeding purchases...")
    
    suppliers = db.query(Supplier).limit(4).all()
    user = db.query(User).first()
    
    if not suppliers or not user:
        print("  ⚠ No suppliers or users found, skipping purchases")
        return
    
    for i, supplier in enumerate(suppliers):
        total = round(random.uniform(500, 10000), 2)
        expected_date = datetime.now() + timedelta(days=random.randint(5, 30))
        purchase = Purchase(
            supplier_id=supplier.id,
            total=total,
            status="pending",
            expected_date=expected_date.date(),
            user_id=user.id,
        )
        db.add(purchase)
        print(f"  ✓ Purchase #{i+1}: ${total}")
    
    db.commit()


def seed_quotes(db):
    """Add seed quotes"""
    print("\n📋 Seeding quotes...")
    
    customers = db.query(Customer).limit(3).all()
    
    if not customers:
        print("  ⚠ No customers found, skipping quotes")
        return
    
    for i, customer in enumerate(customers):
        total = round(random.uniform(1000, 8000), 2)
        valid_until = datetime.now() + timedelta(days=30)
        quote = Quote(
            customer_id=customer.id,
            total=total,
            status="draft",
            valid_until=valid_until.date(),
        )
        db.add(quote)
        print(f"  ✓ Quote #{i+1}: ${total}")
    
    db.commit()


def clear_existing_data(db):
    """Clear existing data from all tables"""
    print("\n🗑️ Clearing existing data...")
    
    # Clear in reverse order to handle foreign keys
    db.query(Quote).delete()
    db.query(Purchase).delete()
    db.query(Sale).delete()
    db.query(Product).delete()
    db.query(Customer).delete()
    db.query(Supplier).delete()
    db.query(Warehouse).delete()
    db.query(Category).delete()
    db.query(User).delete()
    db.commit()
    print("  ✓ Cleared all tables")


def seed_database():
    """Populate the database with seed data"""
    
    try:
        print("🌱 Starting database seeding...\n")
        
        # Initialize database tables
        print("🔨 Initializing database tables...")
        init_db()
        print("✅ Database tables initialized\n")
        
        # Get a database session
        db = SessionLocal()
        
        try:
            # Clear existing data first
            clear_existing_data(db)
            
            # Seed data in correct order
            seed_users(db)
            seed_categories(db)
            seed_warehouses(db)
            seed_suppliers(db)
            seed_customers(db)
            seed_products(db)
            seed_sales(db)
            seed_purchases(db)
            seed_quotes(db)
            
            print("\n✅ Database seeding completed successfully!")
            print("\n📋 Test Credentials:")
            print("  Admin:   admin@inventory.com / Admin@123")
            print("  Manager: manager@inventory.com / Manager@123")
            print("  User:    user@inventory.com / User@123")
            
        finally:
            db.close()
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    seed_database()
