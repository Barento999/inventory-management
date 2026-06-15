#!/usr/bin/env python3
"""
Script to update all users without a role to have the default role 'user'
"""
import sys
import os

# Add the parent directory to the path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models import User

def update_user_roles():
    """Update all users without a role to have the default role 'user'"""
    db = SessionLocal()
    try:
        # Find all users without a role or with null/empty role
        users_without_role = db.query(User).filter(
            (User.role == None) | (User.role == '') | (User.role == ' ')
        ).all()
        
        print(f"Found {len(users_without_role)} users without a role")
        
        for user in users_without_role:
            user.role = "user"
            print(f"Updated user {user.email} to have role 'user'")
        
        db.commit()
        print(f"Successfully updated {len(users_without_role)} users")
        
        # Display all users and their roles
        all_users = db.query(User).all()
        print("\nAll users and their roles:")
        for user in all_users:
            print(f"  - {user.email}: {user.role}")
        
    except Exception as e:
        db.rollback()
        print(f"Error updating user roles: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_user_roles()
