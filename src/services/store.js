const STORAGE_KEY = 'inventory_saas_data';

const defaultData = {
  categories: [
    { id: 1, name: 'Electronics', description: 'Electronic devices and accessories' },
    { id: 2, name: 'Office Supplies', description: 'Stationery and office equipment' },
    { id: 3, name: 'Furniture', description: 'Office and warehouse furniture' },
    { id: 4, name: 'Packaging', description: 'Boxes, labels, and shipping materials' },
  ],
  products: [
    { id: 1, name: 'Wireless Mouse', sku: 'WM-001', categoryId: 1, price: 29.99, cost: 15.0, stock: 120, reorderLevel: 20, status: 'Active', image: 'https://via.placeholder.com/80/6366F1/FFFFFF?text=WM', description: 'Ergonomic wireless mouse' },
    { id: 2, name: 'USB-C Hub', sku: 'UH-002', categoryId: 1, price: 49.99, cost: 28.0, stock: 45, reorderLevel: 15, status: 'Active', image: 'https://via.placeholder.com/80/10B981/FFFFFF?text=UH', description: '7-in-1 USB-C hub' },
    { id: 3, name: 'A4 Paper Ream', sku: 'AP-003', categoryId: 2, price: 8.99, cost: 4.5, stock: 200, reorderLevel: 50, status: 'Active', image: 'https://via.placeholder.com/80/F59E0B/FFFFFF?text=AP', description: '500 sheets premium A4 paper' },
    { id: 4, name: 'Office Chair', sku: 'OC-004', categoryId: 3, price: 249.99, cost: 140.0, stock: 18, reorderLevel: 5, status: 'Active', image: 'https://via.placeholder.com/80/EF4444/FFFFFF?text=OC', description: 'Adjustable ergonomic office chair' },
    { id: 5, name: 'Shipping Box (Medium)', sku: 'SB-005', categoryId: 4, price: 2.49, cost: 0.8, stock: 8, reorderLevel: 25, status: 'Active', image: 'https://via.placeholder.com/80/8B5CF6/FFFFFF?text=SB', description: 'Medium corrugated shipping box' },
    { id: 6, name: 'Mechanical Keyboard', sku: 'MK-006', categoryId: 1, price: 89.99, cost: 52.0, stock: 32, reorderLevel: 10, status: 'Active', image: 'https://via.placeholder.com/80/06B6D4/FFFFFF?text=MK', description: 'RGB mechanical keyboard' },
    { id: 7, name: 'Desk Lamp', sku: 'DL-007', categoryId: 3, price: 39.99, cost: 18.0, stock: 0, reorderLevel: 8, status: 'Inactive', image: 'https://via.placeholder.com/80/64748B/FFFFFF?text=DL', description: 'LED desk lamp with dimmer' },
  ],
  suppliers: [
    { id: 1, name: 'TechSupply Co.', email: 'orders@techsupply.com', phone: '+1-555-0101', address: '123 Tech Park, Austin, TX', contactPerson: 'John Miller' },
    { id: 2, name: 'Office Depot Wholesale', email: 'wholesale@officedepot.com', phone: '+1-555-0102', address: '456 Commerce Blvd, Dallas, TX', contactPerson: 'Sarah Chen' },
    { id: 3, name: 'FurniPro Ltd', email: 'sales@furnipro.com', phone: '+1-555-0103', address: '789 Industrial Way, Houston, TX', contactPerson: 'Mike Roberts' },
  ],
  customers: [
    { id: 1, name: 'Acme Corp', email: 'procurement@acme.com', phone: '+1-555-0201', address: '100 Business Ave, New York, NY' },
    { id: 2, name: 'StartupHub Inc', email: 'orders@startuphub.io', phone: '+1-555-0202', address: '200 Innovation Dr, San Francisco, CA' },
    { id: 3, name: 'Retail Plus', email: 'buying@retailplus.com', phone: '+1-555-0203', address: '300 Market St, Chicago, IL' },
  ],
  stockMovements: [
    { id: 1, type: 'in', productId: 1, quantity: 50, reason: 'Initial stock', reference: 'INIT-001', createdAt: '2026-01-15T10:00:00Z' },
    { id: 2, type: 'out', productId: 2, quantity: 5, reason: 'Sample shipment', reference: 'OUT-001', createdAt: '2026-02-01T14:30:00Z' },
    { id: 3, type: 'adjustment', productId: 5, quantity: -2, reason: 'Damaged items', reference: 'ADJ-001', createdAt: '2026-03-10T09:15:00Z' },
  ],
  purchases: [
    {
      id: 1,
      supplierId: 1,
      status: 'received',
      items: [
        { productId: 1, quantity: 50, unitCost: 15.0 },
        { productId: 6, quantity: 20, unitCost: 52.0 },
      ],
      expectedDate: '2026-01-10',
      createdAt: '2026-01-05T08:00:00Z',
      notes: 'Q1 restock',
    },
    {
      id: 2,
      supplierId: 2,
      status: 'ordered',
      items: [{ productId: 3, quantity: 100, unitCost: 4.5 }],
      expectedDate: '2026-06-20',
      createdAt: '2026-06-01T11:00:00Z',
      notes: '',
    },
  ],
  sales: [
    {
      id: 1,
      customerId: 1,
      status: 'delivered',
      items: [
        { productId: 1, quantity: 10, unitPrice: 29.99 },
        { productId: 2, quantity: 5, unitPrice: 49.99 },
      ],
      createdAt: '2026-02-15T10:00:00Z',
      notes: 'Bulk order',
    },
    {
      id: 2,
      customerId: 2,
      status: 'confirmed',
      items: [{ productId: 6, quantity: 3, unitPrice: 89.99 }],
      createdAt: '2026-06-10T16:00:00Z',
      notes: '',
    },
  ],
  notifications: [
    { id: 1, type: 'low_stock', title: 'Low stock alert', message: 'Shipping Box (Medium) is below reorder level (8 / 25)', read: false, createdAt: '2026-06-13T08:00:00Z' },
    { id: 2, type: 'sale', title: 'New sale order', message: 'Sale #2 confirmed for StartupHub Inc', read: false, createdAt: '2026-06-10T16:05:00Z' },
    { id: 3, type: 'purchase', title: 'Purchase ordered', message: 'Purchase #2 ordered from Office Depot Wholesale', read: true, createdAt: '2026-06-01T11:05:00Z' },
  ],
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
  users: [
    { id: 1, email: 'admin@demo.com', password: 'admin123', name: 'Admin User', role: 'admin', company: 'InventoryPro' },
    { id: 2, email: 'manager@demo.com', password: 'manager123', name: 'Manager User', role: 'manager', company: 'InventoryPro' },
  ],
  nextIds: {
    category: 5,
    product: 8,
    supplier: 4,
    customer: 4,
    stockMovement: 4,
    purchase: 3,
    sale: 3,
    notification: 4,
    user: 3,
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
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  return structuredClone(defaultData);
}

export function saveStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getNextId(store, key) {
  const id = store.nextIds[key];
  store.nextIds[key] = id + 1;
  return id;
}

export function resetStore() {
  localStorage.removeItem(STORAGE_KEY);
  return loadStore();
}

export { enrichProduct, enrichPurchase, enrichSale, enrichMovement, defaultData };
