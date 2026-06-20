# Quick Reference - Frontend Implementation

## Running the Application

### Development
```bash
cd frontend
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Backend (separate terminal)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

---

## Feature URLs

### Products
- List: `/products`
- Create: `/products/create`
- Edit: `/products/:id`

### Customers
- List: `/customers`
- Create: `/customers/create`
- Edit: `/customers/:id`

### Suppliers
- List: `/suppliers`
- Create: `/suppliers/create`
- Edit: `/suppliers/:id`

### Categories
- List: `/categories`
- Create: `/categories/create`
- Edit: `/categories/:id`

### Warehouses
- List: `/warehouses`
- Create: `/warehouses/create`
- Edit: `/warehouses/:id`

### Users
- List: `/users`
- Create: `/users/create`
- Edit: `/users/:id`

### Batches
- List: `/batches`
- Create: `/batches/create`
- Edit: `/batches/:id`

### Serial Numbers
- List: `/serial-numbers`
- Create: `/serial-numbers/create`
- Edit: `/serial-numbers/:id`

### Invoices
- List: `/invoices`
- View: `/invoices/:id`

### Quotes
- List: `/quotes`
- View: `/quotes/:id`

### Returns
- List: `/returns`
- View: `/returns/:id`

---

## Test Credentials

From the seed script:
```
Admin:    admin@example.com / password123
Manager1: manager1@example.com / password123
Manager2: manager2@example.com / password123
Staff:    staff@example.com / password123
User:     user@example.com / password123
Viewer:   viewer@example.com / password123
```

---

## Permission Examples

### Product Management
- `products_view` - View products
- `products_create` - Create products
- `products_update` - Edit products
- `products_delete` - Delete products

### Customer Management
- `customers_view`
- `customers_create`
- `customers_update`
- `customers_delete`

### (Same pattern for all entities)

---

## Common Tasks

### Add a New Feature
1. Create `/frontend/src/pages/feature/FeatureList.jsx`
2. Create `/frontend/src/pages/feature/FeatureDetails.jsx`
3. Add routes in `/frontend/src/routes/index.jsx`
4. Add API service in `/frontend/src/services/api.js`
5. Test and push

### Modify a Form
1. Open `pages/feature/FeatureDetails.jsx`
2. Update the form fields in the JSX
3. Add validation rules to `useForm` config
4. Test the validation

### Add a Column to List
1. Open `pages/feature/FeatureList.jsx`
2. Add column definition to `columns` array:
   ```js
   { key: 'fieldName', title: 'Display Name' }
   ```
3. Or with custom render:
   ```js
   { key: 'fieldName', title: 'Display Name', render: (row) => <Custom>{row.fieldName}</Custom> }
   ```

### Add a Filter
1. Add state: `const [filterName, setFilterName] = useState('');`
2. Add Select/Input in FilterBar
3. Include in API call: `featureApi.list({ ..., filterName })`
4. Update useApi dependency array

---

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── products/
│   │   │   ├── ProductList.jsx
│   │   │   └── ProductDetails.jsx
│   │   ├── customers/
│   │   ├── suppliers/
│   │   ├── categories/
│   │   ├── warehouses/
│   │   ├── users/
│   │   ├── batches/
│   │   ├── serial-numbers/
│   │   ├── invoices/
│   │   ├── quotes/
│   │   ├── returns/
│   │   └── [other pages]
│   ├── components/
│   │   ├── ui/          # Basic UI components
│   │   ├── layout/      # Layout components
│   │   └── shared/      # Shared components
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ToastContext.jsx
│   │   └── DataRefreshContext.jsx
│   ├── hooks/
│   │   ├── useApi.js
│   │   ├── usePermissions.js
│   │   └── [other hooks]
│   ├── services/
│   │   ├── api.js       # API client and service layer
│   │   └── apiClient.js # HTTP client
│   ├── routes/
│   │   └── index.jsx    # All route definitions
│   ├── utils/
│   │   ├── format.js    # Formatting utilities
│   │   ├── status.js    # Status utilities
│   │   └── [others]
│   └── App.jsx
├── package.json
└── vite.config.js
```

---

## Key Contexts

### AuthContext
```js
const { user, loading, login, logout } = useAuth();
// user.id, user.name, user.email, user.role, user.permissions
```

### ToastContext
```js
const { addToast } = useToast();
addToast({ title: 'Success', description: 'Item created', type: 'success' });
// Types: 'success', 'error', 'info', 'warning'
```

### DataRefreshContext
```js
const { version, refresh } = useDataRefresh();
// Call refresh() after mutations to invalidate cache
```

---

## Key Hooks

### useApi
```js
const { data, loading, error, reload } = useApi(
  () => productsApi.list({ page: 1 }),
  [page]  // dependencies
);
```

### usePermissions
```js
const { hasPermission, can } = usePermissions();
can('products_create');      // true/false
hasPermission('products_view'); // true/false
```

---

## API Service Pattern

```js
export const productsApi = {
  list: (filters) => apiClient.get('/products', { params: filters }),
  get: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
};
```

---

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
DEBUG=True
```

---

## Common Issues & Solutions

### 404 Error on API Calls
- Check if backend is running
- Verify API_URL in environment variables
- Check network tab in DevTools

### Permission Denied
- Verify user role has correct permissions
- Check @require_permission decorator in backend
- Verify permission string is correct

### Form Not Submitting
- Check console for errors
- Verify all required fields are filled
- Check form validation rules

### Page Not Loading
- Check if route is protected correctly
- Verify useApi hook dependencies
- Check for infinite loops in useEffect

---

## Useful Commands

```bash
# Frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run linter

# Backend
python manage.py runserver     # Start backend
python manage.py migrate       # Run migrations
python seed.py                 # Seed database
pytest                         # Run tests

# Git
git status               # Check status
git add -A              # Stage all changes
git commit -m "message" # Create commit
git push                # Push to remote
git log --oneline       # View commits
```

---

## Documentation Links

- API Docs: `/API_DOCUMENTATION.md`
- RBAC Info: `/RBAC_EXPLAINED.md`
- Deployment: `/DEPLOYMENT.md`
- Frontend Status: `/FRONTEND_STATUS.md`
- Session Summary: `/SESSION_SUMMARY.md`

---

## Support

For issues or questions:
1. Check documentation files
2. Review similar feature implementation
3. Check backend API endpoint
4. Review console for errors
5. Check git history for reference commits

---

**Last Updated**: June 20, 2026
**Status**: Production Ready ✅
