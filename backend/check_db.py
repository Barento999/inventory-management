#!/usr/bin/env python3
"""
Quick script to check database contents
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models import User, Category, Warehouse, Supplier, Customer, Product, Sale, Purchase, Quote

def check_database():
    db = SessionLocal()
    
    try:
        print("📊 Database Contents\n")
        
        # Users
        users = db.query(User).all()
        print(f"👥 Users ({len(users)}):")
        for user in users:
            print(f"  - {user.email} ({user.role})")
        
        # Categories
        categories = db.query(Category).all()
        print(f"\n📦 Categories ({len(categories)}):")
        for cat in categories:
            print(f"  - {cat.name}")
        
        # Warehouses
        warehouses = db.query(Warehouse).all()
        print(f"\n🏭 Warehouses ({len(warehouses)}):")
        for wh in warehouses:
            print(f"  - {wh.name} ({wh.location})")
        
        # Suppliers
        suppliers = db.query(Supplier).all()
        print(f"\n🏢 Suppliers ({len(suppliers)}):")
        for supp in suppliers:
            print(f"  - {supp.name}")
        
        # Customers
        customers = db.query(Customer).all()
        print(f"\n👥 Customers ({len(customers)}):")
        for cust in customers:
            print(f"  - {cust.name}")
        
        # Products
        products = db.query(Product).all()
        print(f"\n📱 Products ({len(products)}):")
        for prod in products:
            print(f"  - {prod.sku}: {prod.name} (Stock: {prod.stock}, Price: ${prod.price})")
        
        # Sales
        sales = db.query(Sale).all()
        print(f"\n💰 Sales ({len(sales)}):")
        for sale in sales:
            print(f"  - Sale #{sale.id}: ${sale.total} ({sale.status})")
        
        # Purchases
        purchases = db.query(Purchase).all()
        print(f"\n📦 Purchases ({len(purchases)}):")
        for purch in purchases:
            print(f"  - Purchase #{purch.id}: ${purch.total} ({purch.status})")
        
        # Quotes
        quotes = db.query(Quote).all()
        print(f"\n📋 Quotes ({len(quotes)}):")
        for quote in quotes:
            print(f"  - Quote #{quote.id}: ${quote.total} ({quote.status})")
        
    finally:
        db.close()

if __name__ == "__main__":
    check_database()
