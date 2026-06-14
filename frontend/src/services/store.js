const STORAGE_KEY = 'inventory_saas_data';

const defaultData = {
  categories: [],
  warehouses: [],
  products: [],
  serialNumbers: [],
  batches: [],
  suppliers: [],
  customers: [],
  stockMovements: [],
  purchases: [],
  sales: [],
  quotes: [],
  returns: [],
  invoices: [],
  notifications: [],
  settings: {
    companyName: 'InventoryPro',
    email: 'admin@inventorypro.com',
    phone: '+1-555-1000',
    address: '500 SaaS Boulevard, Austin, TX 78701',
    currency: 'USD',
    taxRate: 8.25,
    lowStockThreshold: 10,
    timezone: 'America/Chicago',
  },
  users: [],
  roles: [
    { id: 1, name: 'Admin', description: 'Full system access', permissions: ['all'] },
    { id: 2, name: 'Manager', description: 'Manage inventory and sales', permissions: ['products', 'inventory', 'sales', 'purchases', 'reports'] },
    { id: 3, name: 'Staff', description: 'View and edit products', permissions: ['products', 'inventory'] },
    { id: 4, name: 'Viewer', description: 'Read-only access', permissions: ['view'] },
  ],
  auditLogs: [],
  nextIds: {
    category: 1,
    product: 1,
    supplier: 1,
    customer: 1,
    stockMovement: 1,
    purchase: 1,
    sale: 1,
    notification: 1,
    user: 1,
    warehouse: 1,
    serialNumber: 1,
    batch: 1,
    quote: 1,
    return: 1,
    invoice: 1,
    role: 5,
    auditLog: 1,
  },
};

function enrichProduct(product, categories) {
  const cat = categories.find((c) => c.id === product.categoryId);
  return { ...product, category: cat?.name || 'Uncategorized' };
}

function enrichPurchase(purchase, store) {
  const supplier = store.suppliers.find((s) => s.id === purchase.supplierId);
  const items = purchase.items.map((item) => {
    const product = store.products.find((p) => p.id === item.productId);
    return {
      ...item,
      productName: product?.name || 'Unknown',
      lineTotal: item.quantity * item.unitCost,
    };
  });
  return {
    ...purchase,
    supplierName: supplier?.name || 'Unknown',
    items,
    total: items.reduce((sum, i) => sum + i.lineTotal, 0),
  };
}

function enrichSale(sale, store) {
  const customer = store.customers.find((c) => c.id === sale.customerId);
  const items = sale.items.map((item) => {
    const product = store.products.find((p) => p.id === item.productId);
    return {
      ...item,
      productName: product?.name || 'Unknown',
      lineTotal: item.quantity * item.unitPrice,
    };
  });
  return {
    ...sale,
    customerName: customer?.name || 'Unknown',
    items,
    total: items.reduce((sum, i) => sum + i.lineTotal, 0),
  };
}

function enrichMovement(movement, store) {
  const product = store.products.find((p) => p.id === movement.productId);
  return { ...movement, productName: product?.name || 'Unknown' };
}

export function loadStore() {
  // Always start fresh - no localStorage persistence
  const data = structuredClone(defaultData);
  return data;
}

export function saveStore(data) {
  // No-op - all data comes from backend
  // Data is stored in memory only during the session
}

export function getNextId(store, key) {
  const id = store.nextIds[key];
  store.nextIds[key] = id + 1;
  return id;
}

export function resetStore() {
  // Clear any stored data
  localStorage.removeItem(STORAGE_KEY);
  return loadStore();
}

export { enrichProduct, enrichPurchase, enrichSale, enrichMovement, defaultData };
