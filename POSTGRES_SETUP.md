# PostgreSQL Setup Guide for Linux

You're running **Linux**, so the easiest way to run PostgreSQL is with **Docker**.

## Option 1: Docker (Recommended - Easiest)

### Prerequisites
Install Docker if not already installed:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Enable Docker to run without sudo (optional)
sudo usermod -aG docker $USER
newgrp docker
```

### Start PostgreSQL with Docker

```bash
# Navigate to project root
cd /home/barento/Desktop/inventory-management-SaaS

# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker-compose ps
```

You should see:
```
NAME                  STATUS
inventory-postgres    Up (healthy)
inventory-pgadmin     Up
```

### Connection Details
- **Host**: localhost
- **Port**: 5432
- **Username**: postgres
- **Password**: password
- **Database**: inventory_db

### Stop PostgreSQL
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f postgres
```

---

## Option 2: Local Installation (Alternative)

If you prefer to install PostgreSQL locally without Docker:

### Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Fedora/RHEL:**
```bash
sudo dnf install postgresql postgresql-server
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Setup Database

```bash
# Connect as default user
sudo -u postgres psql

# Create database
CREATE DATABASE inventory_db;

# Create user
CREATE USER postgres WITH PASSWORD 'password';

# Grant permissions
ALTER ROLE postgres WITH CREATEDB;

# Exit
\q
```

### Connection Details
- **Host**: localhost
- **Port**: 5432 (default)
- **Username**: postgres
- **Password**: password
- **Database**: inventory_db

---

## Configure Backend

### 1. Update .env File

```bash
# Open backend/.env
nano /home/barento/Desktop/inventory-management-SaaS/backend/.env

# Make sure it contains:
DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db
```

### 2. Verify Connection

```bash
# Test with psql (if installed locally)
psql postgresql://postgres:password@localhost:5432/inventory_db

# If it connects, you'll see:
# psql (16.0)
# Type "help" for help.
# inventory_db=#

# Exit
\q
```

### 3. Start Backend

```bash
cd /home/barento/Desktop/inventory-management-SaaS/backend

# Make sure Docker is running (if using Docker option)
# docker-compose up -d

# Start backend
./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
✅ Connected to PostgreSQL
✅ Database initialized
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Verify Everything Works

### 1. Check Backend Connection
```bash
curl http://localhost:8000/health
```

Response:
```json
{"status": "healthy"}
```

### 2. Check Tables Created
```bash
# If using Docker
docker-compose exec postgres psql -U postgres -d inventory_db -c "\dt"

# Or if local PostgreSQL
psql postgresql://postgres:password@localhost:5432/inventory_db -c "\dt"
```

You should see:
```
             List of relations
 Schema |     Name      | Type  | Owner
--------+---------------+-------+----------
 public | categories    | table | postgres
 public | customers     | table | postgres
 public | products      | table | postgres
 public | purchases     | table | postgres
 public | quotes        | table | postgres
 public | sales         | table | postgres
 public | suppliers     | table | postgres
 public | users         | table | postgres
 public | warehouses    | table | postgres
```

### 3. Check API Endpoints
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"admin123"}'

# Seed data summary
curl http://localhost:8000/api/seed/seed-summary
```

---

## pgAdmin UI (Optional)

If using Docker, access pgAdmin for visual database management:

1. Open browser: `http://localhost:5050`
2. Login: 
   - Email: `admin@example.com`
   - Password: `admin`
3. Add server:
   - Name: `inventory-postgres`
   - Host: `postgres`
   - Port: `5432`
   - Username: `postgres`
   - Password: `password`

---

## Troubleshooting

### PostgreSQL Won't Start (Docker)

```bash
# Check if port 5432 is already in use
sudo lsof -i :5432

# Kill existing process
sudo kill -9 <PID>

# Try again
docker-compose up -d
```

### Connection Refused

```bash
# Make sure Docker container is running
docker-compose ps

# If not, start it
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Permission Denied

```bash
# Ensure Docker can be run without sudo
sudo usermod -aG docker $USER
newgrp docker

# Restart docker
sudo systemctl restart docker
```

### Backend Can't Connect

1. Check .env has correct DATABASE_URL
2. Verify PostgreSQL is running: `docker-compose ps`
3. Check firewall isn't blocking port 5432
4. Try connecting with psql directly

---

## Quick Start Commands

### Start Everything
```bash
# Start PostgreSQL
docker-compose up -d

# Start backend
cd backend
./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend (in another terminal)
cd frontend
npm run dev
```

### Stop Everything
```bash
# Stop backend (Ctrl+C in terminal)

# Stop PostgreSQL
docker-compose down

# Stop frontend (Ctrl+C in terminal)
```

### View Database
```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d inventory_db

# List tables
\dt

# Query example
SELECT * FROM products;

# Exit
\q
```

---

## Production Deployment

For production, consider:

1. **Persistent Volume**: Ensure database data persists
2. **Backups**: Set up automated backups
3. **Security**: Use strong passwords, restrict network access
4. **Monitoring**: Set up logging and monitoring
5. **SSL/TLS**: Enable encrypted connections

See `DATABASE.md` for more details.

---

## Summary

✅ Use **Docker** (recommended for Linux)  
✅ Run: `docker-compose up -d`  
✅ Backend auto-connects and creates tables  
✅ Access via: `localhost:5432`  
✅ Management UI: `localhost:5050` (pgAdmin)  

**You're all set! 🚀**
