import psycopg2
from psycopg2.extras import RealDictCursor
import os
from contextlib import contextmanager

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/inventory_db"
)


class Database:
    """PostgreSQL database connection handler"""
    
    def __init__(self, url):
        self.url = url
        self.conn = None
    
    def connect(self):
        """Create a database connection"""
        try:
            self.conn = psycopg2.connect(self.url)
            print("✅ Connected to PostgreSQL")
            return self.conn
        except psycopg2.Error as e:
            print(f"❌ Failed to connect to PostgreSQL: {e}")
            raise
    
    def disconnect(self):
        """Close the database connection"""
        if self.conn:
            self.conn.close()
            print("✅ Disconnected from PostgreSQL")
    
    def execute(self, query, params=None):
        """Execute a query and commit"""
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params or ())
            self.conn.commit()
            return cur.rowcount
    
    def fetch_one(self, query, params=None):
        """Fetch a single row"""
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params or ())
            return cur.fetchone()
    
    def fetch_all(self, query, params=None):
        """Fetch all rows"""
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params or ())
            return cur.fetchall()
    
    def create_tables(self):
        """Create all tables if they don't exist"""
        tables = [
            """
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS warehouses (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(500),
                is_default BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                sku VARCHAR(100) UNIQUE NOT NULL,
                barcode VARCHAR(100),
                category_id INTEGER REFERENCES categories(id),
                price DECIMAL(10, 2) NOT NULL,
                cost DECIMAL(10, 2) NOT NULL,
                stock INTEGER DEFAULT 0,
                reorder_level INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'Active',
                description TEXT,
                warehouse_id INTEGER REFERENCES warehouses(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS suppliers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20),
                address VARCHAR(500),
                contact_person VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20),
                address VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS sales (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES customers(id),
                total DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'draft',
                notes TEXT,
                user_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS purchases (
                id SERIAL PRIMARY KEY,
                supplier_id INTEGER REFERENCES suppliers(id),
                total DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'draft',
                expected_date DATE,
                notes TEXT,
                user_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS quotes (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES customers(id),
                total DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'draft',
                valid_until DATE,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
        ]
        
        with self.conn.cursor() as cur:
            for table in tables:
                try:
                    cur.execute(table)
                    self.conn.commit()
                except psycopg2.Error as e:
                    print(f"Error creating table: {e}")
                    self.conn.rollback()


# Global database instance
db = Database(DATABASE_URL)


def get_db():
    """Dependency injection for database connection"""
    return db
