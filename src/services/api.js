import {
  loadStore,
  saveStore,
  getNextId,
  enrichProduct,
  enrichPurchase,
  enrichSale,
  enrichMovement,
} from './store';
import { filterBySearch, paginate } from '../utils/format';

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withStore(fn) {
  return async (...args) => {
    await delay();
    const store = loadStore();
    const result = fn(store, ...args);
    saveStore(store);
    return result;
  };
}

function withStoreRead(fn) {
  return async (...args) => {
    await delay(150);
    const store = loadStore();
    return fn(store, ...args);
  };
}

function recordMovement(store, { type, productId, quantity, reason, reference }) {
  const product = store.products.find((p) => p.id === productId);
  if (!product) throw new Error('Product not found');
  const previousStock = product.stock;
  product.stock = Math.max(0, previousStock + quantity);
  const movement = {
    id: getNextId(store, 'stockMovement'),
    type,
    productId,
    quantity,
    previousStock,
    newStock: product.stock,
    reason,
    reference,
    createdAt: new Date().toISOString(),
  };
  store.stockMovements.unshift(movement);
  checkLowStock(store, product);
  return movement;
}

function checkLowStock(store, product) {
  if (product.stock <= product.reorderLevel) {
    const exists = store.notifications.some(
      (n) => n.type === 'low_stock' && n.message.includes(product.name) && !n.read
    );
    if (!exists) {
      store.notifications.unshift({
        id: getNextId(store, 'notification'),
        type: 'low_stock',
        title: 'Low stock alert',
        message: `${product.name} is below reorder level (${product.stock} / ${product.reorderLevel})`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  }
}

// Auth
export const authApi = {
  login: withStoreRead((store, email, password) => {
    const user = store.users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const { password: _, ...safe } = user;
    return { ...safe, token: `mock-token-${user.id}` };
  }),

  register: withStore((store, data) => {
    if (store.users.some((u) => u.email === data.email)) {
      throw new Error('Email already registered');
    }
    const user = {
      id: getNextId(store, 'user'),
      email: data.email,
      password: data.password,
      name: data.fullName,
      role: 'admin',
      company: data.company,
    };
    store.users.push(user);
    if (data.company) store.settings.companyName = data.company;
    const { password: _, ...safe } = user;
    return { ...safe, token: `mock-token-${user.id}` };
  }),

  forgotPassword: async (_email) => {
    await delay();
    return { message: 'If that email exists, a reset link has been sent.' };
  },

  resetPassword: async () => {
    await delay();
    return { message: 'Password reset successful' };
  },
};

// Categories
export const categoriesApi = {
  list: withStoreRead((store, { search = '', page = 1, pageSize = 10 } = {}) => {
    let items = store.categories.map((c) => ({
      ...c,
      productCount: store.products.filter((p) => p.categoryId === c.id).length,
    }));
    items = filterBySearch(items, search, ['name', 'description']);
    return paginate(items, page, pageSize);
  }),

  get: withStoreRead((store, id) => {
    const cat = store.categories.find((c) => c.id === Number(id));
    if (!cat) throw new Error('Category not found');
    return {
      ...cat,
      productCount: store.products.filter((p) => p.categoryId === cat.id).length,
      products: store.products
        .filter((p) => p.categoryId === cat.id)
        .map((p) => enrichProduct(p, store.categories)),
    };
  }),

  create: withStore((store, data) => {
    const cat = { id: getNextId(store, 'category'), name: data.name, description: data.description || '' };
    store.categories.push(cat);
    return cat;
  }),

  update: withStore((store, id, data) => {
    const cat = store.categories.find((c) => c.id === Number(id));
    if (!cat) throw new Error('Category not found');
    Object.assign(cat, { name: data.name, description: data.description || '' });
    return cat;
  }),

  delete: withStore((store, id) => {
    const numId = Number(id);
    if (store.products.some((p) => p.categoryId === numId)) {
      throw new Error('Cannot delete category with assigned products');
    }
    store.categories = store.categories.filter((c) => c.id !== numId);
    return { success: true };
  }),
};

// Products
export const productsApi = {
  list: withStoreRead((store, { search = '', categoryId, status, page = 1, pageSize = 10 } = {}) => {
    let items = store.products.map((p) => enrichProduct(p, store.categories));
    if (categoryId) items = items.filter((p) => p.categoryId === Number(categoryId));
    if (status) items = items.filter((p) => p.status === status);
    items = filterBySearch(items, search, ['name', 'sku', 'category']);
    return paginate(items, page, pageSize);
  }),

  get: withStoreRead((store, id) => {
    const product = store.products.find((p) => p.id === Number(id));
    if (!product) throw new Error('Product not found');
    return enrichProduct(product, store.categories);
  }),

  create: withStore((store, data) => {
    const product = {
      id: getNextId(store, 'product'),
      name: data.name,
      sku: data.sku,
      categoryId: Number(data.categoryId),
      price: Number(data.price),
      cost: Number(data.cost || 0),
      stock: Number(data.stock || 0),
      reorderLevel: Number(data.reorderLevel || 10),
      status: data.status || 'Active',
      image: data.image || `https://via.placeholder.com/80/6366F1/FFFFFF?text=${encodeURIComponent(data.sku?.slice(0, 2) || 'PR')}`,
      description: data.description || '',
    };
    store.products.push(product);
    if (product.stock > 0) {
      recordMovement(store, {
        type: 'in',
        productId: product.id,
        quantity: product.stock,
        reason: 'Initial stock',
        reference: `PROD-${product.id}`,
      });
    }
    return enrichProduct(product, store.categories);
  }),

  update: withStore((store, id, data) => {
    const product = store.products.find((p) => p.id === Number(id));
    if (!product) throw new Error('Product not found');
    Object.assign(product, {
      name: data.name,
      sku: data.sku,
      categoryId: Number(data.categoryId),
      price: Number(data.price),
      cost: Number(data.cost || 0),
      reorderLevel: Number(data.reorderLevel || 10),
      status: data.status || 'Active',
      image: data.image || product.image,
      description: data.description || '',
    });
    checkLowStock(store, product);
    return enrichProduct(product, store.categories);
  }),

  delete: withStore((store, id) => {
    store.products = store.products.filter((p) => p.id !== Number(id));
    return { success: true };
  }),
};

// Suppliers
export const suppliersApi = {
  list: withStoreRead((store, { search = '', page = 1, pageSize = 10 } = {}) => {
    let items = store.suppliers.map((s) => ({
      ...s,
      purchaseCount: store.purchases.filter((p) => p.supplierId === s.id).length,
    }));
    items = filterBySearch(items, search, ['name', 'email', 'contactPerson']);
    return paginate(items, page, pageSize);
  }),

  get: withStoreRead((store, id) => {
    const supplier = store.suppliers.find((s) => s.id === Number(id));
    if (!supplier) throw new Error('Supplier not found');
    return supplier;
  }),

  create: withStore((store, data) => {
    const supplier = { id: getNextId(store, 'supplier'), ...data };
    store.suppliers.push(supplier);
    return supplier;
  }),

  update: withStore((store, id, data) => {
    const supplier = store.suppliers.find((s) => s.id === Number(id));
    if (!supplier) throw new Error('Supplier not found');
    Object.assign(supplier, data);
    return supplier;
  }),

  delete: withStore((store, id) => {
    store.suppliers = store.suppliers.filter((s) => s.id !== Number(id));
    return { success: true };
  }),

  options: withStoreRead((store) =>
    store.suppliers.map((s) => ({ value: s.id, label: s.name }))
  ),
};

// Customers
export const customersApi = {
  list: withStoreRead((store, { search = '', page = 1, pageSize = 10 } = {}) => {
    let items = store.customers.map((c) => ({
      ...c,
      orderCount: store.sales.filter((s) => s.customerId === c.id).length,
    }));
    items = filterBySearch(items, search, ['name', 'email', 'phone']);
    return paginate(items, page, pageSize);
  }),

  get: withStoreRead((store, id) => {
    const customer = store.customers.find((c) => c.id === Number(id));
    if (!customer) throw new Error('Customer not found');
    return customer;
  }),

  create: withStore((store, data) => {
    const customer = { id: getNextId(store, 'customer'), ...data };
    store.customers.push(customer);
    return customer;
  }),

  update: withStore((store, id, data) => {
    const customer = store.customers.find((c) => c.id === Number(id));
    if (!customer) throw new Error('Customer not found');
    Object.assign(customer, data);
    return customer;
  }),

  delete: withStore((store, id) => {
    store.customers = store.customers.filter((c) => c.id !== Number(id));
    return { success: true };
  }),

  options: withStoreRead((store) =>
    store.customers.map((c) => ({ value: c.id, label: c.name }))
  ),
};

// Inventory
export const inventoryApi = {
  list: withStoreRead((store, { search = '', type, page = 1, pageSize = 10 } = {}) => {
    let items = store.stockMovements.map((m) => enrichMovement(m, store));
    if (type) items = items.filter((m) => m.type === type);
    items = filterBySearch(items, search, ['productName', 'reason', 'reference']);
    return paginate(items, page, pageSize);
  }),

  stockLevels: withStoreRead((store, { search = '', lowStockOnly = false } = {}) => {
    let items = store.products.map((p) => {
      const enriched = enrichProduct(p, store.categories);
      return {
        ...enriched,
        isLowStock: p.stock <= p.reorderLevel,
        value: p.stock * p.cost,
      };
    });
    if (lowStockOnly) items = items.filter((p) => p.isLowStock);
    items = filterBySearch(items, search, ['name', 'sku', 'category']);
    return items;
  }),

  adjust: withStore((store, { productId, type, quantity, reason, reference }) => {
    const qty = Number(quantity);
    if (type === 'out') {
      const product = store.products.find((p) => p.id === Number(productId));
      if (product && product.stock < qty) throw new Error('Insufficient stock');
      return recordMovement(store, {
        type: 'out',
        productId: Number(productId),
        quantity: -qty,
        reason,
        reference: reference || `OUT-${Date.now()}`,
      });
    }
    if (type === 'in') {
      return recordMovement(store, {
        type: 'in',
        productId: Number(productId),
        quantity: qty,
        reason,
        reference: reference || `IN-${Date.now()}`,
      });
    }
    return recordMovement(store, {
      type: 'adjustment',
      productId: Number(productId),
      quantity: qty,
      reason,
      reference: reference || `ADJ-${Date.now()}`,
    });
  }),
};

// Purchases
export const purchasesApi = {
  list: withStoreRead((store, { search = '', status, page = 1, pageSize = 10 } = {}) => {
    let items = store.purchases.map((p) => enrichPurchase(p, store));
    if (status) items = items.filter((p) => p.status === status);
    items = filterBySearch(items, search, ['supplierName', 'notes']);
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return paginate(items, page, pageSize);
  }),

  get: withStoreRead((store, id) => {
    const purchase = store.purchases.find((p) => p.id === Number(id));
    if (!purchase) throw new Error('Purchase not found');
    return enrichPurchase(purchase, store);
  }),

  create: withStore((store, data) => {
    const purchase = {
      id: getNextId(store, 'purchase'),
      supplierId: Number(data.supplierId),
      status: data.status || 'draft',
      items: data.items.map((i) => ({
        productId: Number(i.productId),
        quantity: Number(i.quantity),
        unitCost: Number(i.unitCost),
      })),
      expectedDate: data.expectedDate || '',
      createdAt: new Date().toISOString(),
      notes: data.notes || '',
    };
    store.purchases.unshift(purchase);
    return enrichPurchase(purchase, store);
  }),

  updateStatus: withStore((store, id, status) => {
    const purchase = store.purchases.find((p) => p.id === Number(id));
    if (!purchase) throw new Error('Purchase not found');
    const prev = purchase.status;
    purchase.status = status;
    if (status === 'received' && prev !== 'received') {
      purchase.items.forEach((item) => {
        recordMovement(store, {
          type: 'in',
          productId: item.productId,
          quantity: item.quantity,
          reason: `Purchase #${purchase.id} received`,
          reference: `PO-${purchase.id}`,
        });
      });
      store.notifications.unshift({
        id: getNextId(store, 'notification'),
        type: 'purchase',
        title: 'Purchase received',
        message: `Purchase #${purchase.id} marked as received`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    return enrichPurchase(purchase, store);
  }),

  delete: withStore((store, id) => {
    store.purchases = store.purchases.filter((p) => p.id !== Number(id));
    return { success: true };
  }),
};

// Sales
export const salesApi = {
  list: withStoreRead((store, { search = '', status, page = 1, pageSize = 10 } = {}) => {
    let items = store.sales.map((s) => enrichSale(s, store));
    if (status) items = items.filter((s) => s.status === status);
    items = filterBySearch(items, search, ['customerName', 'notes']);
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return paginate(items, page, pageSize);
  }),

  get: withStoreRead((store, id) => {
    const sale = store.sales.find((s) => s.id === Number(id));
    if (!sale) throw new Error('Sale not found');
    return enrichSale(sale, store);
  }),

  create: withStore((store, data) => {
    const sale = {
      id: getNextId(store, 'sale'),
      customerId: Number(data.customerId),
      status: data.status || 'draft',
      items: data.items.map((i) => ({
        productId: Number(i.productId),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
      createdAt: new Date().toISOString(),
      notes: data.notes || '',
    };
    store.sales.unshift(sale);
    return enrichSale(sale, store);
  }),

  updateStatus: withStore((store, id, status) => {
    const sale = store.sales.find((s) => s.id === Number(id));
    if (!sale) throw new Error('Sale not found');
    const prev = sale.status;
    const deductStatuses = ['confirmed', 'shipped', 'delivered'];
    if (deductStatuses.includes(status) && !deductStatuses.includes(prev)) {
      sale.items.forEach((item) => {
        const product = store.products.find((p) => p.id === item.productId);
        if (product && product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        recordMovement(store, {
          type: 'out',
          productId: item.productId,
          quantity: -item.quantity,
          reason: `Sale #${sale.id} ${status}`,
          reference: `SO-${sale.id}`,
        });
      });
    }
    sale.status = status;
    store.notifications.unshift({
      id: getNextId(store, 'notification'),
      type: 'sale',
      title: 'Sale updated',
      message: `Sale #${sale.id} status changed to ${status}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
    return enrichSale(sale, store);
  }),

  delete: withStore((store, id) => {
    store.sales = store.sales.filter((s) => s.id !== Number(id));
    return { success: true };
  }),
};

function buildSummary(store) {
    const products = store.products;
    const sales = store.sales.map((s) => enrichSale(s, store));
    const delivered = sales.filter((s) => ['confirmed', 'shipped', 'delivered'].includes(s.status));
    const totalRevenue = delivered.reduce((sum, s) => sum + s.total, 0);
    const monthlySales = {};
    delivered.forEach((s) => {
      const month = new Date(s.createdAt).toLocaleString('en-US', { month: 'short' });
      monthlySales[month] = (monthlySales[month] || 0) + s.total;
    });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = months.map((name) => ({
      name,
      sales: Math.round(monthlySales[name] || 0),
      revenue: Math.round((monthlySales[name] || 0) * 0.7),
    }));

    return {
      totalProducts: products.length,
      totalSales: delivered.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      lowStockItems: products.filter((p) => p.stock <= p.reorderLevel).length,
      totalCustomers: store.customers.length,
      totalSuppliers: store.suppliers.length,
      inventoryValue: Math.round(products.reduce((sum, p) => sum + p.stock * p.cost, 0) * 100) / 100,
      chartData,
      recentMovements: store.stockMovements.slice(0, 5).map((m) => enrichMovement(m, store)),
      recentSales: sales.slice(0, 5),
    };
}

// Dashboard & Reports
export const dashboardApi = {
  summary: withStoreRead((store) => buildSummary(store)),
};

export const reportsApi = {
  salesByMonth: withStoreRead((store) => buildSummary(store).chartData),
  topProducts: withStoreRead((store) => {
    const counts = {};
    store.sales.forEach((sale) => {
      if (!['confirmed', 'shipped', 'delivered'].includes(sale.status)) return;
      sale.items.forEach((item) => {
        const product = store.products.find((p) => p.id === item.productId);
        if (!product) return;
        if (!counts[product.id]) counts[product.id] = { name: product.name, quantity: 0, revenue: 0 };
        counts[product.id].quantity += item.quantity;
        counts[product.id].revenue += item.quantity * item.unitPrice;
      });
    });
    return Object.values(counts).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }),
  inventoryValuation: withStoreRead((store) =>
    store.products.map((p) => ({
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      cost: p.cost,
      value: p.stock * p.cost,
      category: enrichProduct(p, store.categories).category,
    }))
  ),
  lowStock: withStoreRead((store) =>
    store.products
      .filter((p) => p.stock <= p.reorderLevel)
      .map((p) => enrichProduct(p, store.categories))
  ),
};

// Settings
export const settingsApi = {
  get: withStoreRead((store) => store.settings),
  update: withStore((store, data) => {
    Object.assign(store.settings, data);
    return store.settings;
  }),
  resetData: async () => {
    await delay();
    localStorage.removeItem('inventory_saas_data');
    return loadStore();
  },
};

// Notifications
export const notificationsApi = {
  list: withStoreRead((store) => store.notifications),
  markRead: withStore((store, id) => {
    const n = store.notifications.find((x) => x.id === Number(id));
    if (n) n.read = true;
    return n;
  }),
  markAllRead: withStore((store) => {
    store.notifications.forEach((n) => { n.read = true; });
    return store.notifications;
  }),
};

// Global search
export const searchApi = {
  global: withStoreRead((store, query) => {
    if (!query?.trim()) return { products: [], customers: [], suppliers: [], purchases: [], sales: [] };
    const q = query.toLowerCase();
    return {
      products: store.products
        .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
        .slice(0, 5)
        .map((p) => enrichProduct(p, store.categories)),
      customers: store.customers.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 5),
      suppliers: store.suppliers.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 5),
      purchases: store.purchases
        .map((p) => enrichPurchase(p, store))
        .filter((p) => p.supplierName.toLowerCase().includes(q) || String(p.id).includes(q))
        .slice(0, 5),
      sales: store.sales
        .map((s) => enrichSale(s, store))
        .filter((s) => s.customerName.toLowerCase().includes(q) || String(s.id).includes(q))
        .slice(0, 5),
    };
  }),
};

export const productOptions = withStoreRead((store) =>
  store.products
    .filter((p) => p.status === 'Active')
    .map((p) => ({ value: p.id, label: `${p.name} (${p.sku}) — Stock: ${p.stock}` }))
);

export const categoryOptions = withStoreRead((store) =>
  store.categories.map((c) => ({ value: c.id, label: c.name }))
);
