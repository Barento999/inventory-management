# Frontend Integration Testing Guide

## Step 1: Verify Both Servers are Running

### Backend Server Status
```bash
# Check if backend is running
curl http://localhost:8000/docs

# Expected: Should open Swagger UI documentation
```

### Frontend Server Status
```bash
# Frontend should be running on
http://localhost:3000
```

---

## Test Cases

### Test 1: User Registration Flow ✅
**Objective**: Verify user can register and receive JWT token

**Steps**:
1. Open http://localhost:3000 in browser
2. Click "Sign Up" or "Register"
3. Enter:
   - Email: test_user_1@example.com
   - Password: testpass123
   - Name: Test User 1
4. Click "Sign Up"

**Expected Results**:
- ✅ User created successfully
- ✅ Token received and saved to localStorage
- ✅ Redirected to dashboard
- ✅ User name appears in header

**Command to verify backend**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","name":"Test"}'
# Expected: 200 OK with access_token
```

---

### Test 2: Token Persistence Across Reload ✅
**Objective**: Verify token persists after page reload

**Steps**:
1. Login successfully (use Test 1 credentials)
2. Wait for dashboard to load
3. Press F5 to refresh page
4. Wait for page to reload

**Expected Results**:
- ✅ Page reloads without returning to login
- ✅ Dashboard displays normally
- ✅ User remains logged in
- ✅ Token still in localStorage

**Verification**:
```bash
# In browser console (F12):
console.log(localStorage.getItem('token'))
# Should show JWT token
```

---

### Test 3: Protected Route Access ✅
**Objective**: Verify user can access protected routes with valid token

**Steps**:
1. Login successfully
2. Navigate to:
   - /dashboard
   - /products
   - /customers
   - /suppliers
   - /sales
3. Verify each page loads correctly

**Expected Results**:
- ✅ All pages load successfully
- ✅ Data displays from backend
- ✅ No 401 or 403 errors
- ✅ User role visible (e.g., "user")

---

### Test 4: Unauthorized Access Handling ✅
**Objective**: Verify unauthorized users are redirected to login

**Steps**:
1. Open browser console (F12)
2. Clear localStorage: `localStorage.clear()`
3. Try to access: http://localhost:3000/dashboard
4. Try to access: http://localhost:3000/products

**Expected Results**:
- ✅ Redirected to login page
- ✅ See "Please log in to continue"
- ✅ Cannot access protected content

---

### Test 5: API Calls with Token ✅
**Objective**: Verify API calls include token and work correctly

**Steps**:
1. Login successfully
2. Open browser Network tab (F12)
3. Click on a resource (Products, Customers, etc.)
4. Check network request

**Expected Results**:
- ✅ Request headers include: `Authorization: Bearer [token]`
- ✅ Response status: 200 OK
- ✅ Response contains data
- ✅ No 401 errors

**Manual verification**:
```bash
# Get token from login
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test API call
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/products/
# Expected: 200 OK with products array
```

---

### Test 6: Permission-Based UI Visibility ✅
**Objective**: Verify UI elements show/hide based on permissions

**Steps**:
1. Login as regular "user" role
2. Check visible features:
   - [ ] Dashboard accessible
   - [ ] Products visible
   - [ ] Create Product button visible/hidden
   - [ ] Delete buttons visible/hidden
   - [ ] User Management NOT visible
   - [ ] Settings NOT visible
   - [ ] Audit Logs NOT visible

3. Check for permission denied messages

**Expected Results**:
- ✅ User can only see permitted features
- ✅ Buttons for restricted actions hidden or disabled
- ✅ No error messages for normal usage
- ✅ Attempting restricted action shows "Permission Denied"

---

### Test 7: Logout Functionality ✅
**Objective**: Verify user can logout and token is cleared

**Steps**:
1. Login successfully
2. Click "Logout" button
3. Verify redirect to login page
4. Try to access protected page

**Expected Results**:
- ✅ Logged out successfully
- ✅ Redirected to login page
- ✅ localStorage token cleared
- ✅ Cannot access protected pages
- ✅ Must login again to continue

**Verification**:
```bash
# In browser console after logout:
console.log(localStorage.getItem('token'))
# Should be null or empty
```

---

### Test 8: Multiple User Roles ✅
**Objective**: Verify different roles have different access levels

**Create test users**:
```bash
# Admin user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"pass123","name":"Admin"}'

# Manager user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@test.com","password":"pass123","name":"Manager"}'

# Viewer user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@test.com","password":"pass123","name":"Viewer"}'
```

**Note**: Users register as "user" role by default. To test other roles, update in database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
UPDATE users SET role = 'manager' WHERE email = 'manager@test.com';
UPDATE users SET role = 'viewer' WHERE email = 'viewer@test.com';
```

**Test each user**:
1. Login with admin@test.com → Should see all features
2. Login with manager@test.com → Should see management features
3. Login with viewer@test.com → Should see read-only features

---

### Test 9: Error Messages ✅
**Objective**: Verify appropriate error messages display

**Test Cases**:
1. Invalid email on login → "Invalid email or password"
2. Wrong password → "Invalid email or password"
3. Access denied endpoint → "Permission denied"
4. Invalid token → "Unauthorized" or redirect to login
5. Network error → "Network error occurred"

---

### Test 10: Cross-Page Navigation ✅
**Objective**: Verify user stays logged in while navigating

**Steps**:
1. Login successfully
2. Navigate to Products
3. Navigate to Customers
4. Navigate to Dashboard
5. Click browser back button
6. Click browser forward button

**Expected Results**:
- ✅ Token persists across navigation
- ✅ User stays logged in
- ✅ Each page loads correctly
- ✅ Data displays properly
- ✅ No 401 errors during navigation

---

## Test Results Summary

### Successful Tests ✅
- [ ] User Registration
- [ ] Login
- [ ] Token Persistence
- [ ] Protected Routes
- [ ] Unauthorized Access
- [ ] API Calls with Token
- [ ] UI Permission Visibility
- [ ] Logout
- [ ] Multiple Roles
- [ ] Error Messages
- [ ] Cross-Page Navigation

### Issues Found
(List any issues found during testing)
- 

---

## Troubleshooting

### Issue: "Cannot reach backend"
```bash
# Verify backend is running
curl http://localhost:8000/docs
# If fails, restart backend:
cd backend && uvicorn app.main:app --reload
```

### Issue: "Token not saving"
```bash
# Check browser localStorage
# Open F12 → Application → Local Storage → http://localhost:3000
# Should see 'token' entry with JWT value
```

### Issue: "Stuck on login page"
```bash
# Clear localStorage and try again
# F12 → Console:
localStorage.clear()
# Then refresh page
```

### Issue: "Permission denied on valid user"
```bash
# Check user role in database
# Connect to PostgreSQL:
psql -U postgres -d inventory_saas
SELECT id, email, role FROM users WHERE email = 'test@example.com';
# Verify role is correct (admin, manager, staff, user, viewer)
```

---

## Success Criteria

✅ All tests pass when:
1. Backend running on http://localhost:8000
2. Frontend running on http://localhost:3000
3. Database connected and populated
4. User can complete full authentication flow
5. Tokens persist across page reloads
6. All protected routes require authentication
7. Permission checks work correctly
8. All error messages are appropriate

---

## Next Steps After Testing

If all tests pass:
1. ✅ Proceed to Step 2: Fix Frontend Routing
2. ✅ Then Step 3: Test All Key User Flows
3. ✅ Then Step 4: Data & Seeding

If issues found:
1. Review error messages
2. Check backend logs
3. Check browser console (F12)
4. Review server response codes
5. Debug token handling
6. Fix and re-test

---

**Status**: Ready for testing
**Date**: June 16, 2026
