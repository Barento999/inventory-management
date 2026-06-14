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

from app.core.database import db
from app.seeds.seed_data import CATEGORIES, WAREHOUSES, PRODUCTS, SUPPLIERS, CUSTOMERS
from app.core.security import hash_password


def seed_users():
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
    
    for user in users:
        query = "INSERT INTO users (email, name, password_hash, role) VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING"
        db.execute(query, (user["email"], user["name"], user["password_hash"], user["role"]))
        print(f"  ✓ {user['email']} ({user['role']})")
    
    return users


def seed_categories():
    """Add seed categories"""
    print("\n📦 Seeding categories...")
    
    for cat in CATEGORIES:
        query = "INSERT INTO categories (name, description) VALUES (%s, %s) ON CONFLICT DO NOTHING"
        db.execute(query, (cat["name"], cat["description"]))
        print(f"  ✓ {cat['name']}")


def seed_warehouses():
    """Add seed warehouses"""
    print("\n🏭 Seeding warehouses...")
    
    for i, wh in enumerate(WAREHOUSES):
        is_default = i == 0  # First one is default
        query = "INSERT INTO warehouses (name, location, is_default) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING"
        db.execute(query, (wh["name"], wh["location"], is_default))
        print(f"  ✓ {wh['name']}")


def seed_suppliers():
    """Add seed suppliers"""
    print("\n🏢 Seeding suppliers...")
    
    for supp in SUPPLIERS:
        query = "INSERT INTO suppliers (name, email, phone, address, contact_person) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING"
        db.execute(
            query,
            (
                supp["name"],
                supp["email"],
                supp["phone"],
                supp["address"],
                supp["contactPerson"],
            ),
        )
        print(f"  ✓ {supp['name']}")


def seed_customers():
    """Add seed customers"""
    print("\n👥 Seeding customers...")
    
    for cust in CUSTOMERS:
        query = "INSERT INTO customers (name, email, phone, address) VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING"
        db.execute(query, (cust["name"], cust["email"], cust["phone"], cust["address"]))
        print(f"  ✓ {cust['name']}")


def seed_products():
    """Add seed products"""
    print("\n📱 Seeding products...")
    
    for prod in PRODUCTS:
        query = """
        INSERT INTO products (name, sku, barcode, category_id, price, cost, stock, 
                             reorder_level, status, description, warehouse_id)
        VALUES (%s, %s, %s, 
                (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1),
                %s, %s, %s, %s, %s, %s,
                (SELECT id FROM warehouses LIMIT 1))
        ON CONFLICT DO NOTHING
        """
        db.execute(
            query,
            (
                prod["name"],
                prod["sku"],
                prod["barcode"],
                prod["price"],
                prod["cost"],
                prod["stock"],
                prod["reorderLevel"],
                prod["status"],
                prod["description"],
            ),
        )
        print(f"  ✓ {prod['sku']}: {prod['name']}")


def seed_sales():
    """Add seed sales transactions"""
    print("\n💰 Seeding sales...")
    
    # Get customer and user IDs
    customers = db.fetch_all("SELECT id FROM customers LIMIT 5")
    users = db.fetch_all("SELECT id FROM users LIMIT 1")
    
    if not customers or not users:
        print("  ⚠ No customers or users found, skipping sales")
        return
    
    user_id = users[0]['id']
    
    for i, customer in enumerate(customers):
        total = round(random.uniform(100, 5000), 2)
        query = """
        INSERT INTO sales (customer_id, total, status, user_id)
        VALUES (%s, %s, %s, %s)
        """
        db.execute(query, (customer['id'], total, "completed", user_id))
        print(f"  ✓ Sale #{i+1}: ${total}")


def seed_purchases():
    """Add seed purchase orders"""
    print("\n📦 Seeding purchases...")
    
    # Get supplier and user IDs
    suppliers = db.fetch_all("SELECT id FROM suppliers LIMIT 4")
    users = db.fetch_all("SELECT id FROM users LIMIT 1")
    
    if not suppliers or not users:
        print("  ⚠ No suppliers or users found, skipping purchases")
        return
    
    user_id = users[0]['id']
    
    for i, supplier in enumerate(suppliers):
        total = round(random.uniform(500, 10000), 2)
        expected_date = datetime.now() + timedelta(days=random.randint(5, 30))
        query = """
        INSERT INTO purchases (supplier_id, total, status, expected_date, user_id)
        VALUES (%s, %s, %s, %s, %s)
        """
        db.execute(
            query,
            (supplier['id'], total, "pending", expected_date.date(), user_id),
        )
        print(f"  ✓ Purchase #{i+1}: ${total}")


def seed_quotes():
    """Add seed quotes"""
    print("\n📋 Seeding quotes...")
    
    # Get customer IDs
    customers = db.fetch_all("SELECT id FROM customers LIMIT 3")
    
    if not customers:
        print("  ⚠ No customers found, skipping quotes")
        return
    
    for i, customer in enumerate(customers):
        total = round(random.uniform(1000, 8000), 2)
        valid_until = datetime.now() + timedelta(days=30)
        query = """
        INSERT INTO quotes (customer_id, total, status, valid_until)
        VALUES (%s, %s, %s, %s)
        """
        db.execute(query, (customer['id'], total, "draft", valid_until.date()))
        print(f"  ✓ Quote #{i+1}: ${total}")


def clear_existing_data():
    """Clear existing data from all tables"""
    print("\n🗑️ Clearing existing data...")
    
    tables = ["quotes", "purchases", "sales", "products", "customers", "suppliers", "warehouses", "categories", "users"]
    
    for table in tables:
        try:
            db.execute(f"DELETE FROM {table}")
            print(f"  ✓ Cleared {table}")
        except Exception as e:
            print(f"  ⚠ Could not clear {table}: {e}")


def seed_database():
    """Populate the database with seed data"""
    
    try:
        print("🌱 Starting database seeding...\n")
        
        # Connect to database first
        print("🔌 Connecting to database...")
        db.connect()
        print("✅ Connected to database\n")
        
        # Clear existing data first
        clear_existing_data()
        
        # Seed data in correct order
        seed_users()
        seed_categories()
        seed_warehouses()
        seed_suppliers()
        seed_customers()
        seed_products()
        seed_sales()
        seed_purchases()
        seed_quotes()
        
        print("\n✅ Database seeding completed successfully!")
        print("\n📋 Test Credentials:")
        print("  Admin:   admin@inventory.com / Admin@123")
        print("  Manager: manager@inventory.com / Manager@123")
        print("  User:    user@inventory.com / User@123")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.disconnect()


if __name__ == "__main__":
    seed_database()
