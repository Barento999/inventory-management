# Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

---

## 📦 Installation

### Option 1: Docker Compose (Recommended)
```bash
cd ~/Desktop/inventory-management-SaaS
docker-compose up
```
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

### Option 2: Local Development

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 Key Pages

### Management
- `/products` - Product inventory
- `/suppliers` - Supplier management
- `/customers` - Customer relationships
- `/inventory` - Stock tracking
- `/warehouses` - Warehouse management
- `/users` - User administration

### Transactions
- `/sales` - Sales orders
- `/purchases` - Purchase orders
- `/shipping` - Shipment tracking
- `/invoices` - Invoice management

### Analytics & Reports
- `/` - Enhanced dashboard
- `/analytics` - Real-time analytics
- `/reports` - Advanced reporting
- `/reports/custom` - Custom report builder

### Administration
- `/settings` - Company settings
- `/settings/notifications` - Notification preferences
- `/audit-logs` - Activity logs
- `/docs` - API documentation
- `/performance` - Performance monitoring

### Advanced Features
- `/bulk` - Bulk operations demo
- `/integration` - Bulk & file upload integration
- `/vendors` - Vendor portal

---

## 🔐 Default Login

```
Email: admin@example.com
Password: password123
```

**Note**: Change credentials in production environment

---

## 📝 API Examples

### Authentication
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Get Products
```bash
curl -X GET "http://localhost:8000/api/products?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Bulk Update
```bash
curl -X POST "http://localhost:8000/api/bulk/update?entity_type=products" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {"id": 1, "updates": {"status": "Active"}},
    {"id": 2, "updates": {"price": 99.99}}
  ]'
```

### Upload File
```bash
curl -X POST http://localhost:8000/api/uploads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

---

## 🎨 Features

### Frontend Features
✅ Dark mode with high contrast
✅ Responsive mobile design
✅ WCAG 2.1 AA accessibility
✅ Real-time notifications
✅ Drag-and-drop file upload
✅ Bulk operations with undo/redo
✅ Advanced search & filtering
✅ Multi-format data export
✅ Internationalization (i18n) ready

### Backend Features
✅ JWT authentication
✅ Role-based access control
✅ Full audit logging
✅ Bulk operations
✅ File management
✅ Real-time metrics
✅ Advanced reporting
✅ Permission-based endpoints

---

## 🔧 Configuration

### Environment Variables (.env)

**Backend:**
```
DATABASE_URL=postgresql://user:password@localhost/inventory_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Frontend:**
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Inventory Management
```

---

## 🧪 Testing

### Lint Check
```bash
cd frontend
npm run lint
```

### Build Production
```bash
npm run build
```

### Backend Tests
```bash
cd backend
pytest
```

---

## 📊 Performance

- **Bundle Size**: 255 KB gzipped
- **Build Time**: ~13 seconds
- **Build Modules**: 3,040+
- **ESLint Errors**: 0
- **Pages**: 50+

---

## 🗂️ Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/endpoints/        # API endpoints
│   │   ├── models/               # Database models
│   │   ├── core/                 # Core utilities
│   │   └── main.py               # FastAPI app
│   ├── requirements.txt
│   └── seed.py                   # Database seeding
├── frontend/
│   ├── src/
│   │   ├── pages/                # React pages
│   │   ├── components/           # React components
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # API services
│   │   ├── locales/              # Translations
│   │   └── utils/                # Utilities
│   └── package.json
└── docker-compose.yml
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Database Connection Error
```bash
# Ensure PostgreSQL is running
sudo service postgresql start

# Test connection
psql -U postgres -d inventory_db
```

### Frontend Build Failed
```bash
# Clear cache
rm -rf frontend/node_modules frontend/package-lock.json
npm install
npm run build
```

---

## 📞 Support

- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Issues**: Check PROJECT_STATUS.md

---

## 🔗 Useful Links

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)

---

**Happy Building! 🚀**
