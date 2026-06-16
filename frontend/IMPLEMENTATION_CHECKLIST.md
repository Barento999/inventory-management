# RBAC Implementation Checklist

Use this checklist to track your RBAC implementation progress.

## Phase 1: Verify Installation ✓

- [x] Core files created
  - [x] `/src/utils/permissions.js` - Permission utilities
  - [x] `/src/hooks/usePermissions.js` - Permission hook
  - [x] `/src/hooks/useCanPerformAction.js` - Custom action hooks
  - [x] `/src/components/ProtectedRoute.jsx` - Route protection
  - [x] `/src/components/PermissionButton.jsx` - Permission buttons
  - [x] `/src/components/IfPermission.jsx` - Conditional rendering
  - [x] `/src/components/PermissionInfo.jsx` - Debug components
  - [x] `/src/services/permissionInterceptor.js` - API error handling
  - [x] `/src/services/apiWithPermissions.js` - Permission-aware APIs
  - [x] `/src/context/AuthContext.jsx` - Updated with permissions
  - [x] `/src/components/layout/Sidebar.jsx` - Updated with permissions

- [x] Documentation created
  - [x] `RBAC_USAGE_GUIDE.md` - Comprehensive guide
  - [x] `RBAC_INTEGRATION_EXAMPLE.md` - Integration examples
  - [x] `RBAC_QUICK_REFERENCE.md` - Quick reference
  - [x] `RBAC_IMPLEMENTATION_SUMMARY.md` - Summary

## Phase 2: Test Core Functionality

- [ ] Test AuthContext permissions
  - [ ] User logs in and permissions are set
  - [ ] User object has `permissions` array
  - [ ] Permissions match user role
  - [ ] Different roles have different permissions

- [ ] Test usePermissions hook
  - [ ] `has()` works correctly
  - [ ] `hasAny()` works correctly
  - [ ] `hasAll()` works correctly
  - [ ] `hasRole()` works correctly
  - [ ] CRUD check methods work

- [ ] Test ProtectedRoute component
  - [ ] Authorized users can access route
  - [ ] Unauthorized users are redirected
  - [ ] Fallback component shows correctly
  - [ ] Works with single and multiple permissions

- [ ] Test PermissionButton component
  - [ ] Button shows/hides based on permission
  - [ ] Button disabled correctly
  - [ ] Toast shows on denial
  - [ ] Multiple variants work

- [ ] Test IfPermission component
  - [ ] Shows content when authorized
  - [ ] Shows fallback when unauthorized
  - [ ] Works with single and multiple permissions

## Phase 3: Integrate Into Pages

### Dashboard
- [ ] Wrap with ProtectedRoute
- [ ] Add permission checks for sections
- [ ] Test with different roles

### Products
- [ ] Wrap ProductList with ProtectedRoute (products_view)
- [ ] Add Create button with PermissionButton (products_create)
- [ ] Add Edit/Delete buttons with PermissionButton
- [ ] Update ProductDetails page
- [ ] Test with different roles

### Categories
- [ ] Wrap with ProtectedRoute
- [ ] Add permission buttons for actions
- [ ] Hide/disable based on permissions

### Customers
- [ ] Wrap with ProtectedRoute
- [ ] Add permission buttons for CRUD operations
- [ ] Test visibility

### Suppliers
- [ ] Wrap with ProtectedRoute
- [ ] Add permission checks
- [ ] Test with manager and staff roles

### Inventory
- [ ] Wrap with ProtectedRoute
- [ ] Add permission checks for adjustment
- [ ] Hide dangerous operations for non-managers

### Sales & Purchases
- [ ] Wrap with ProtectedRoute
- [ ] Add create/edit/delete buttons
- [ ] Implement permission checks

### Invoices & Returns
- [ ] Wrap with ProtectedRoute
- [ ] Add permission buttons
- [ ] Test all operations

### Users (Admin)
- [ ] Protect admin pages
- [ ] Check users_view permission
- [ ] Add users_create button
- [ ] Add users_update on rows
- [ ] Add users_delete on rows

### Settings
- [ ] Protect settings page
- [ ] Check settings_update permission
- [ ] Disable fields for viewers

### Reports
- [ ] Check reports_view permission
- [ ] Add export button if reports_export
- [ ] Hide from unauthorized users

### Audit Logs
- [ ] Check audit_logs_view permission
- [ ] Only show to managers/admins

## Phase 4: Update Navigation

- [ ] Sidebar filters correctly by permission
  - [ ] Products section shows/hides
  - [ ] Orders section shows/hides
  - [ ] Admin section shows/hides
  - [ ] Settings shows/hides
  - [ ] Reports shows/hides

- [ ] Top navbar displays user role
- [ ] Role badge displays correctly

## Phase 5: Update API Services

- [ ] Wrap productsApi calls
  - [ ] list() - check products_view
  - [ ] create() - check products_create
  - [ ] update() - check products_update
  - [ ] delete() - check products_delete

- [ ] Wrap salesApi calls
  - [ ] Similar pattern as products

- [ ] Wrap purchasesApi calls
  - [ ] Similar pattern as products

- [ ] Wrap inventoryApi calls
  - [ ] adjust() - check inventory_adjust
  - [ ] getMovements() - check inventory_movements

- [ ] Wrap usersApi calls
  - [ ] All CRUD operations protected

- [ ] Error handling works
  - [ ] Permission errors caught
  - [ ] User-friendly messages shown
  - [ ] Audit trail logged

## Phase 6: Test Permissions By Role

### Admin Role
- [ ] Can access all pages
- [ ] Can see all menu items
- [ ] Can perform all operations
- [ ] Can access admin features
- [ ] Can manage users
- [ ] Can view settings

### Manager Role
- [ ] Can access most pages
- [ ] Cannot access some admin pages
- [ ] Can view and create in most areas
- [ ] Cannot delete users
- [ ] Can view settings (but maybe not reset)
- [ ] Menu filtered correctly

### Staff Role
- [ ] Can view inventory
- [ ] Can create sales (not delete)
- [ ] Cannot create purchases
- [ ] Cannot access admin
- [ ] Sidebar shows limited options
- [ ] Certain buttons disabled

### User Role
- [ ] Can only view
- [ ] Cannot modify most data
- [ ] Can create sales (maybe)
- [ ] Cannot access reports export
- [ ] Menu very limited

### Viewer Role
- [ ] Read-only access
- [ ] No create buttons
- [ ] No edit buttons
- [ ] No delete buttons
- [ ] Can access reports
- [ ] Cannot export

## Phase 7: Test Edge Cases

- [ ] User with no permissions
  - [ ] Can't access anything
  - [ ] Routes redirect correctly

- [ ] User loses permission
  - [ ] Already open page disables features
  - [ ] Buttons become disabled

- [ ] Permission denied from API
  - [ ] Toast shows
  - [ ] User doesn't see data
  - [ ] No console errors

- [ ] Audit trail
  - [ ] Permission denials logged
  - [ ] Can view audit trail
  - [ ] Can clear audit trail

- [ ] Token expires
  - [ ] User redirected to login
  - [ ] Permissions cleared

## Phase 8: Test UI/UX

- [ ] Buttons hide gracefully
  - [ ] No layout shift
  - [ ] Consistent appearance

- [ ] Error messages clear
  - [ ] Easy to understand
  - [ ] Tell user why denied
  - [ ] Suggest action

- [ ] Toast notifications work
  - [ ] Show on permission denied
  - [ ] Auto-dismiss
  - [ ] Not annoying

- [ ] Loading states work
  - [ ] Page loads while checking permissions
  - [ ] Spinner shows
  - [ ] No flash of unauthorized content

- [ ] Mobile responsive
  - [ ] Sidebar works on mobile
  - [ ] Buttons stack properly
  - [ ] No overflow

## Phase 9: Performance Testing

- [ ] Permission checks fast
  - [ ] No noticeable delay
  - [ ] Especially with many permissions

- [ ] Page load time acceptable
  - [ ] No additional API calls
  - [ ] Permissions from localStorage

- [ ] No memory leaks
  - [ ] Test with different roles
  - [ ] Switch accounts multiple times
  - [ ] Monitor memory usage

- [ ] Sidebar filtering efficient
  - [ ] Instant on mount
  - [ ] No re-renders

## Phase 10: Documentation & Cleanup

- [ ] Code well commented
  - [ ] Hard logic explained
  - [ ] Complex components documented

- [ ] Remove development code
  - [ ] Debug components commented out
  - [ ] Console.log() removed
  - [ ] Dev-only features behind NODE_ENV check

- [ ] Update README
  - [ ] Add RBAC section
  - [ ] Link to documentation
  - [ ] Explain role setup

- [ ] Create team documentation
  - [ ] How to add new permissions
  - [ ] How to protect new pages
  - [ ] How to check permissions

## Phase 11: Testing with Backend

- [ ] Backend validating permissions
  - [ ] API endpoints return 403
  - [ ] Error messages clear
  - [ ] Frontend handles correctly

- [ ] Frontend permission match backend
  - [ ] Same permission names
  - [ ] Same role levels
  - [ ] Consistent across system

- [ ] End-to-end tests pass
  - [ ] Create as admin
  - [ ] Edit as manager
  - [ ] View as staff
  - [ ] Access denied as user

## Phase 12: Production Ready

- [ ] All integration complete
- [ ] All tests passing
- [ ] Documentation complete
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security properly implemented
- [ ] Audit trail working
- [ ] Error handling comprehensive
- [ ] UI/UX polished
- [ ] Mobile responsive
- [ ] Ready for deployment

## Common Integration Points

### For Each Page:
1. Check permissions before rendering
2. Wrap with ProtectedRoute
3. Hide/disable UI elements appropriately
4. Handle permission errors
5. Test with different roles

### For Each Button:
1. Use PermissionButton component
2. Or wrap with IfPermission
3. Set appropriate permission
4. Show loading state during operation
5. Handle errors

### For Each API Call:
1. Check permissions before calling
2. Show loading state
3. Handle 403 errors
4. Show user-friendly message
5. Log to audit trail

## Deployment Checklist

- [ ] All code reviewed
- [ ] No console errors
- [ ] No console warnings
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Performance benchmarked
- [ ] Accessibility checked
- [ ] Documentation complete
- [ ] Team trained
- [ ] Monitor in production

## Post-Deployment

- [ ] Monitor error logs
- [ ] Check audit trail
- [ ] Gather user feedback
- [ ] Fix any issues
- [ ] Document learnings
- [ ] Plan improvements

## Support Resources

- **Stuck?** Check `RBAC_USAGE_GUIDE.md`
- **Quick lookup?** Use `RBAC_QUICK_REFERENCE.md`
- **Need examples?** See `RBAC_INTEGRATION_EXAMPLE.md`
- **Overview?** Read `RBAC_IMPLEMENTATION_SUMMARY.md`
- **Custom hooks?** Check `useCanPerformAction.js`
- **Debug?** Use PermissionInfoButton component

## Notes

```
Start date: ___________
Completed phases: _____ / 12

Issues found:
1. _________________________________
2. _________________________________
3. _________________________________

Questions:
1. _________________________________
2. _________________________________
3. _________________________________

Completed date: ___________
```
