# Complete Installation Guide

Your system is **Linux**. Follow these steps to get everything running.

## Quick Start (5 minutes)

### Step 1: Install Docker

```bash
chmod +x /home/barento/Desktop/inventory-management-SaaS/install-docker.sh
./install-docker.sh
```

Or manually:
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Start PostgreSQL

```bash
cd /home/barento/Desktop/inventory-management-SaaS
docker-compose up -d
```

Verify:
```bash
docker-compose ps
```

### Step 3: Start Backend

```bash
cd backend
./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
✅ Connected to PostgreSQL
✅ Database initialized
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 4: Start Frontend (new terminal)

```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

---

## What's Running

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:8000 | REST API |
| API Docs | http://localhost:8000/docs | Swagger UI |
| Frontend | http://localhost:5173 | Web application |
| PostgreSQL | localhost:5432 | Database |
| pgAdmin | http://localhost:5050 | DB Management (optional) |

---

## Directory Structure

```
inventory-management-SaaS/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── core/              # Core modules (auth, database, config)
│   │   └── seeds/             # Seed data
│   ├── venv/                  # Virtual environment
│   ├── requirements.txt        # Python dependencies
│   ├── .env                   # Environment variables
│   └── seed.py                # Seed data script
│
├── frontend/                   # React/Vite frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   └── context/           # React context
│   ├── package.json           # Node dependencies
│   └── vite.config.js         # Build config
│
├── docker-compose.yml          # Docker setup (PostgreSQL + pgAdmin)
├── POSTGRES_SETUP.md           # PostgreSQL setup guide
├── DATABASE.md                 # Database documentation
├── SEED_DATA.md               # Seed data information
├── BACKEND_TECH_STACK.md      # Backend technologies
└── GETTING_STARTED.md         # General getting started
```

---

## Detailed Setup

### Backend Setup

1. **Virtual Environment**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Environment Variables**
```bash
# .env already configured with:
DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

3. **Start Backend**
```bash
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Start Dev Server**
```bash
npm run dev
```

3. **Build for Production**
```bash
npm run build
# Output: frontend/dist/
```

### PostgreSQL Setup

1. **Start with Docker**
```bash
docker-compose up -d
```

2. **Verify Connection**
```bash
docker-compose exec postgres psql -U postgres -d inventory_db -c "SELECT 1;"
```

3. **Access pgAdmin** (optional)
- URL: http://localhost:5050
- Email: admin@example.com
- Password: admin

---

## Testing the Setup

### Test 1: API Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

### Test 2: Seed Data
```bash
curl http://localhost:8000/api/seed/seed-summary
```

Expected response: JSON with counts of seed data

### Test 3: Authentication
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"admin123"}'
```

Expected response: JWT token and user info

### Test 4: Database Tables
```bash
docker-compose exec postgres psql -U postgres -d inventory_db -c "\dt"
```

Expected: 9 tables listed (users, products, customers, etc.)

---

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@demo.com | admin123 | admin |
| manager@demo.com | manager123 | manager |
| staff@demo.com | staff123 | staff |

Or register a new account via the UI.

---

## Common Commands

### Database
```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres

# Connect to database
docker-compose exec postgres psql -U postgres -d inventory_db

# Backup database
docker-compose exec postgres pg_dump -U postgres inventory_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres inventory_db < backup.sql
```

### Backend
```bash
# Activate virtual environment
source backend/venv/bin/activate

# Start development server
uvicorn app.main:app --reload

# Build for production
# (Just copy the Python files, no build needed)
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Docker
```bash
# See all running containers
docker ps

# View container logs
docker logs <container_id>

# Stop all containers
docker-compose down

# Remove everything (containers + volumes)
docker-compose down -v

# Rebuild without cache
docker-compose up -d --build
```

---

## Troubleshooting

### Backend Won't Start
```
Error: Connection refused (PostgreSQL)
```
**Solution:**
```bash
docker-compose up -d
docker-compose ps  # Verify running
```

### Port Already in Use
```
Error: Address already in use
```
**Solution:**
```bash
# Find what's using port 8000
sudo lsof -i :8000

# Kill the process
sudo kill -9 <PID>

# Or change port
uvicorn app.main:app --port 8001
```

### Docker Permission Error
```
Error: permission denied while trying to connect to Docker daemon
```
**Solution:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### pgAdmin Won't Connect
```
Error: couldn't connect to server
```
**Solution:**
- Ensure PostgreSQL container is running: `docker-compose ps`
- In pgAdmin, use hostname: `postgres` (not `localhost`)
- Check network: containers must be on same network

---

## Environment Files

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000/api
```

---

## Performance Tips

1. **Backend**: Use production mode for better performance
   ```bash
   uvicorn app.main:app --workers 4
   ```

2. **Frontend**: Use production build
   ```bash
   npm run build
   npm run preview
   ```

3. **Database**: Add indexes for frequently queried columns
   ```sql
   CREATE INDEX idx_products_sku ON products(sku);
   CREATE INDEX idx_customers_email ON customers(email);
   ```

---

## Next Steps

1. ✅ Install Docker
2. ✅ Start PostgreSQL: `docker-compose up -d`
3. ✅ Start Backend: `uvicorn app.main:app --reload`
4. ✅ Start Frontend: `npm run dev`
5. ✅ Access: http://localhost:5173
6. ✅ Log in with demo account
7. ✅ Explore the application!

---

## Support

- **Backend API Docs**: http://localhost:8000/docs
- **Database**: See `DATABASE.md`
- **Tech Stack**: See `BACKEND_TECH_STACK.md`
- **Seed Data**: See `SEED_DATA.md`
- **PostgreSQL**: See `POSTGRES_SETUP.md`

---

Happy coding! 🚀
