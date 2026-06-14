#!/bin/bash

echo "🐘 Starting PostgreSQL with Docker..."
echo ""

# Change to project directory
cd /home/barento/Desktop/inventory-management-SaaS

# Start PostgreSQL
sudo docker compose up -d

# Wait for container to start
echo "⏳ Waiting for PostgreSQL to start..."
sleep 10

# Check status
echo ""
echo "📊 Container Status:"
sudo docker compose ps

echo ""
echo "✅ PostgreSQL started!"
echo ""
echo "Connection Details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Username: postgres"
echo "  Password: password"
echo "  Database: inventory_db"
echo ""
echo "📝 Next steps:"
echo "  1. Start backend: cd backend && ./venv/bin/uvicorn app.main:app --reload"
echo "  2. Start frontend: cd frontend && npm run dev"
echo "  3. Access API: http://localhost:8000"
echo "  4. Access Frontend: http://localhost:5173"
echo "  5. pgAdmin (optional): http://localhost:5050"
