/**
 * Custom hooks for common RBAC patterns
 * These provide simplified, business-logic focused permission checks
 */

import { usePermissions } from './usePermissions';
import { PERMISSION_GROUPS } from '../utils/permissions';

/**
 * Hook to check if user can manage products
 */
export const useCanManageProducts = () => {
  const { has, hasAll } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.PRODUCTS.VIEW),
    canCreate: has(PERMISSION_GROUPS.PRODUCTS.CREATE),
    canEdit: has(PERMISSION_GROUPS.PRODUCTS.UPDATE),
    canDelete: has(PERMISSION_GROUPS.PRODUCTS.DELETE),
    canFullyManage: hasAll([
      PERMISSION_GROUPS.PRODUCTS.VIEW,
      PERMISSION_GROUPS.PRODUCTS.CREATE,
      PERMISSION_GROUPS.PRODUCTS.UPDATE,
      PERMISSION_GROUPS.PRODUCTS.DELETE,
    ]),
  };
};

/**
 * Hook to check if user can manage inventory
 */
export const useCanManageInventory = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.INVENTORY.VIEW),
    canAdjust: has(PERMISSION_GROUPS.INVENTORY.ADJUST),
    canViewMovements: has(PERMISSION_GROUPS.INVENTORY.MOVEMENTS),
  };
};

/**
 * Hook to check if user can manage sales
 */
export const useCanManageSales = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.SALES.VIEW),
    canCreate: has(PERMISSION_GROUPS.SALES.CREATE),
    canEdit: has(PERMISSION_GROUPS.SALES.UPDATE),
    canDelete: has(PERMISSION_GROUPS.SALES.DELETE),
  };
};

/**
 * Hook to check if user can manage purchases
 */
export const useCanManagePurchases = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.PURCHASES.VIEW),
    canCreate: has(PERMISSION_GROUPS.PURCHASES.CREATE),
    canEdit: has(PERMISSION_GROUPS.PURCHASES.UPDATE),
    canDelete: has(PERMISSION_GROUPS.PURCHASES.DELETE),
  };
};

/**
 * Hook to check if user can manage users
 */
export const useCanManageUsers = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.USERS.VIEW),
    canCreate: has(PERMISSION_GROUPS.USERS.CREATE),
    canEdit: has(PERMISSION_GROUPS.USERS.UPDATE),
    canDelete: has(PERMISSION_GROUPS.USERS.DELETE),
  };
};

/**
 * Hook to check if user can manage customers
 */
export const useCanManageCustomers = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.CUSTOMERS.VIEW),
    canCreate: has(PERMISSION_GROUPS.CUSTOMERS.CREATE),
    canEdit: has(PERMISSION_GROUPS.CUSTOMERS.UPDATE),
    canDelete: has(PERMISSION_GROUPS.CUSTOMERS.DELETE),
  };
};

/**
 * Hook to check if user can manage suppliers
 */
export const useCanManageSuppliers = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.SUPPLIERS.VIEW),
    canCreate: has(PERMISSION_GROUPS.SUPPLIERS.CREATE),
    canEdit: has(PERMISSION_GROUPS.SUPPLIERS.UPDATE),
    canDelete: has(PERMISSION_GROUPS.SUPPLIERS.DELETE),
  };
};

/**
 * Hook to check if user can manage invoices
 */
export const useCanManageInvoices = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.INVOICES.VIEW),
    canCreate: has(PERMISSION_GROUPS.INVOICES.CREATE),
    canEdit: has(PERMISSION_GROUPS.INVOICES.UPDATE),
    canDelete: has(PERMISSION_GROUPS.INVOICES.DELETE),
  };
};

/**
 * Hook to check if user can manage returns
 */
export const useCanManageReturns = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.RETURNS.VIEW),
    canCreate: has(PERMISSION_GROUPS.RETURNS.CREATE),
    canEdit: has(PERMISSION_GROUPS.RETURNS.UPDATE),
    canDelete: has(PERMISSION_GROUPS.RETURNS.DELETE),
  };
};

/**
 * Hook to check if user can manage categories
 */
export const useCanManageCategories = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.CATEGORIES.VIEW),
    canCreate: has(PERMISSION_GROUPS.CATEGORIES.CREATE),
    canEdit: has(PERMISSION_GROUPS.CATEGORIES.UPDATE),
    canDelete: has(PERMISSION_GROUPS.CATEGORIES.DELETE),
  };
};

/**
 * Hook to check if user can manage warehouses
 */
export const useCanManageWarehouses = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.WAREHOUSES.VIEW),
    canCreate: has(PERMISSION_GROUPS.WAREHOUSES.CREATE),
    canEdit: has(PERMISSION_GROUPS.WAREHOUSES.UPDATE),
    canDelete: has(PERMISSION_GROUPS.WAREHOUSES.DELETE),
  };
};

/**
 * Hook to check if user can manage serial numbers
 */
export const useCanManageSerialNumbers = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.SERIAL_NUMBERS.VIEW),
    canCreate: has(PERMISSION_GROUPS.SERIAL_NUMBERS.CREATE),
    canEdit: has(PERMISSION_GROUPS.SERIAL_NUMBERS.UPDATE),
    canDelete: has(PERMISSION_GROUPS.SERIAL_NUMBERS.DELETE),
  };
};

/**
 * Hook to check if user can manage batches
 */
export const useCanManageBatches = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.BATCHES.VIEW),
    canCreate: has(PERMISSION_GROUPS.BATCHES.CREATE),
    canEdit: has(PERMISSION_GROUPS.BATCHES.UPDATE),
    canDelete: has(PERMISSION_GROUPS.BATCHES.DELETE),
  };
};

/**
 * Hook to check if user can access reports
 */
export const useCanAccessReports = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.REPORTS.VIEW),
    canExport: has(PERMISSION_GROUPS.REPORTS.EXPORT),
  };
};

/**
 * Hook to check if user can manage settings
 */
export const useCanManageSettings = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.SETTINGS.VIEW),
    canUpdate: has(PERMISSION_GROUPS.SETTINGS.UPDATE),
    canReset: has(PERMISSION_GROUPS.SETTINGS.RESET),
  };
};

/**
 * Hook to check if user can view audit logs
 */
export const useCanViewAuditLogs = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.AUDIT_LOGS.VIEW),
  };
};

/**
 * Hook to check if user can manage roles
 */
export const useCanManageRoles = () => {
  const { has } = usePermissions();
  return {
    canView: has(PERMISSION_GROUPS.ROLES.VIEW),
    canCreate: has(PERMISSION_GROUPS.ROLES.CREATE),
    canEdit: has(PERMISSION_GROUPS.ROLES.UPDATE),
    canDelete: has(PERMISSION_GROUPS.ROLES.DELETE),
  };
};

/**
 * Example Usage:
 * 
 * function ProductManagement() {
 *   const { canView, canCreate, canEdit, canDelete } = useCanManageProducts();
 *   
 *   if (!canView) {
 *     return <div>Access denied</div>;
 *   }
 *   
 *   return (
 *     <div>
 *       {canCreate && <CreateButton />}
 *       {canEdit && <EditButton />}
 *       {canDelete && <DeleteButton />}
 *     </div>
 *   );
 * }
 */
