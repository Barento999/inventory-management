import apiClient from './apiClient';
import { loadStore, saveStore, getNextId, enrichProduct, enrichPurchase, enrichSale, enrichMovement } from './store';

// Helper functions for store-based operations
function withStoreRead(fn) {
  return (...args) => {
    const store = loadStore();
    return fn(store, ...args);
  };
}

function withStore(fn) {
  return (...args) => {
    const store = loadStore();
    const result = fn(store, ...args);
    saveStore(store);
    return result;
  };
}

// Utility functions
function paginate(items, page, pageSize) {
  const skip = (page - 1) * pageSize;
  return {
    items: items.slice(skip, skip + pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
}

function filterBySearch(items, search, fields) {
  if (!search?.trim()) return items;
  const q = search.toLowerCase();
  return items.filter((item) => fields.some((field) => String(item[field]).toLowerCase().includes(q)));
}

function recordMovement(store, movement) {
  const id = getNextId(store, 'stockMovement');
  const newMovement = { id, ...movement, createdAt: new Date().toISOString() };
  store.stockMovements.push(newMovement);
  
  // Update product stock
  const product = store.products.find((p) => p.id === movement.productId);
  if (product) {
    if (movement.type === 'in' || movement.type === 'adjustment') {
      product.stock += movement.quantity;
    } else if (movement.type === 'out') {
      product.stock -= movement.quantity;
    }
  }
  return newMovement;
}

function buildSummary(store) {
  const totalProducts = store.products.length;
  const totalValue = store.products.reduce((sum, p) => sum + p.stock * p.cost, 0);
  const lowStockProducts = store.products.filter((p) => p.stock <= p.reorderLevel).length;
  
  const salesRevenue = store.sales.reduce((sum, s) => sum + (s.items?.reduce((itemSum, i) => itemSum + i.quantity * i.unitPrice, 0) || 0), 0);
  const purchasesCost = store.purchases.reduce((sum, p) => sum + (p.items?.reduce((itemSum, i) => itemSum + i.quantity * i.unitCost, 0) || 0), 0);
  
  return {
    totalProducts,
    totalValue,
    lowStockProducts,
    totalSales: store.sales.length,
    totalPurchases: store.purchases.length,
    salesRevenue,
    purchasesCost,
    chartData: [
      { month: 'Jan', sales: 1200, purchases: 800 },
      { month: 'Feb', sales: 1900, purchases: 1200 },
      { month: 'Mar', sales: 1500, purchases: 900 },
    ],
  };
}

// Auth
export const authApi = {
  login: async (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },

  register: async (data) => {
    return apiClient.post('/auth/register', data);
  },

  forgotPassword: async (email) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, password) => {
    return apiClient.post('/auth/reset-password', { token, password });
  },
};

// Categories
export const categoriesApi = {
  list: async ({ search = '', page = 1, pageSize = 10 } = {}) => {
    const params = new URLSearchParams({ search: String(search), page: String(page), page_size: String(pageSize) });
    return apiClient.get(`/categories?${params.toString()}`);
  },

  get: async (id) => {
    return apiClient.get(`/categories/${id}`);
  },

  create: async (data) => {
    return apiClient.post('/categories', data);
  },

  update: async (id, data) => {
    return apiClient.put(`/categories/${id}`, data);
  },

  delete: async (id) => {
    return apiClient.delete(`/categories/${id}`);
  },
};

// Products
export const productsApi = {
  list: async ({ search = '', categoryId, status, warehouseId, page = 1, pageSize = 10 } = {}) => {
    const params = new URLSearchParams({ search: String(search), page: String(page), pageSize: String(pageSize) });
    if (categoryId) params.append('categoryId', categoryId);
    if (status) params.append('status', status);
    if (warehouseId) params.append('warehouseId', warehouseId);
    return apiClient.get(`/products?${params.toString()}`);
  },

  get: async (id) => {
    return apiClient.get(`/products/${id}`);
  },

  create: async (data) => {
    return apiClient.post('/products', data);
  },

  update: async (id, data) => {
    return apiClient.put(`/products/${id}`, data);
  },

  delete: async (id) => {
    return apiClient.delete(`/products/${id}`);
  },
};

// Suppliers
export const suppliersApi = {
  list: async ({ search = '', page = 1, pageSize = 10 } = {}) => {
    const params = new URLSearchParams({ search: String(search), page: String(page), pageSize: String(pageSize) });
    return apiClient.get(`/suppliers?${params.toString()}`);
  },

  get: async (id) => {
    return apiClient.get(`/suppliers/${id}`);
  },

  create: async (data) => {
    return apiClient.post('/suppliers', data);
  },

  update: async (id, data) => {
    return apiClient.put(`/suppliers/${id}`, data);
  },

  delete: async (id) => {
    return apiClient.delete(`/suppliers/${id}`);
  },

  options: async () => {
    const result = await apiClient.get('/suppliers');
    return result.map((s) => ({ value: s.id, label: s.name }));
  },
};

// Customers
export const customersApi = {
  list: async ({ search = '', page = 1, pageSize = 10 } = {}) => {
    const params = new URLSearchParams({ search: String(search), page: String(page), pageSize: String(pageSize) });
    return apiClient.get(`/customers?${params.toString()}`);
  },

  get: async (id) => {
    return apiClient.get(`/customers/${id}`);
  },

  create: async (data) => {
    return apiClient.post('/customers', data);
  },

  update: async (id, data) => {
    return apiClient.put(`/customers/${id}`, data);
  },

  delete: async (id) => {
    return apiClient.delete(`/customers/${id}`);
  },

  options: async () => {
    const result = await apiClient.get('/customers');
    return result.map((c) => ({ value: c.id, label: c.name }));
  },
};

// Inventory
export const inventoryApi = {
  list: async ({ search = '', type, page = 1, pageSize = 10 } = {}) => {
    const params = new URLSearchParams({ search: String(search), page: String(page), pageSize: String(pageSize) });
    if (type) params.append('type', type);
    return apiClient.get(`/inventory/movements?${params.toString()}`);
  },

  stockLevels: async ({ search = '', lowStockOnly = false } = {}) => {
    const params = new URLSearchParams({ search: String(search) });
    if (lowStockOnly) params.append('low_stock', 'true');
    return apiClient.get(`/inventory/stock-levels?${params.toString()}`);
  },

  adjust: async ({ productId, type, quantity, reason, reference }) => {
    return apiClient.post('/inventory/adjust', {
      productId,
      type,
      quantity,
      reason,
      reference,
    });
  },
};

// Purchases
export const purchasesApi = {
  list: async ({ search = '', status, page = 1, pageSize = 10 } = {}) => {
    const params = new URLSearchParams({ search: String(search), page: String(page), pageSize: String(pageSize) });
    if (status) params.append('status', status);
    return apiClient.get(`/purchases?${params.toString()}`);
  },

  get: async (id) => {
    return apiClient.get(`/purchases/${id}`);
  },

  create: async (data) => {
    return apiClient.post('/purchases', data);
  },

  updateStatus: async (id, status) => {
    return apiClient.put(`/purchases/${id}/status`, { status });
  },

  delete: async (id) => {
    return apiClient.delete(`/purchases/${id}`);
  },

  approve: async (id) => {
    return apiClient.put(`/purchases/${id}/approve`);
  },
};

// Sales
export const salesApi = {
  list: async ({ search = '', status, page = 1, pageSize = 10 } = {}) => {
    const params = new URLSearchParams({ search: String(search), page: String(page), pageSize: String(pageSize) });
    if (status) params.append('status', status);
    return apiClient.get(`/sales?${params.toString()}`);
  },

  get: async (id) => {
    return apiClient.get(`/sales/${id}`);
  },

  create: async (data) => {
    return apiClient.post('/sales', data);
  },

  updateStatus: async (id, status) => {
    return apiClient.put(`/sales/${id}/status`, { status });
  },

  delete: async (id) => {
    return apiClient.delete(`/sales/${id}`);
  },
};

// Dashboard & Reports
export const dashboardApi = {
  summary: async () => {
    return apiClient.get('/dashboard/summary');
  },
};

export const reportsApi = {
  salesByMonth: async () => {
    const summary = await apiClient.get('/dashboard/summary');
    return summary.chartData;
  },
  topProducts: async () => {
    // Placeholder - needs backend implementation
    return [];
  },
  inventoryValuation: async () => {
    const stockLevels = await apiClient.get('/inventory/stock-levels');
    return stockLevels.map((p) => ({
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      cost: p.cost,
      value: p.value,
      category: 'Unknown', // needs category join
    }));
  },
  lowStock: async () => {
    return apiClient.get('/inventory/stock-levels?low_stock=true');
  },
};

// Settings
export const settingsApi = {
  get: async () => {
    // Placeholder - needs backend implementation
    return {
      companyName: 'Inventory Management',
      currency: 'USD',
      lowStockThreshold: 10,
    };
  },
  update: async (data) => {
    // Placeholder - needs backend implementation
    return data;
  },
  resetData: async () => {
    // This should call backend to reset data
    return {};
  },
};

// Notifications
export const notificationsApi = {
  list: async () => {
    // Placeholder - needs backend implementation
    return [];
  },
  markRead: async (id) => {
    // Placeholder - needs backend implementation
    return {};
  },
  markAllRead: async () => {
    // Placeholder - needs backend implementation
    return [];
  },
};

// Global search
export const searchApi = {
  global: async (query) => {
    if (!query?.trim()) return { products: [], customers: [], suppliers: [], purchases: [], sales: [] };
    
    // Search products
    const products = await apiClient.get(`/products?search=${query}&pageSize=5`);
    
    // Search customers
    const customers = await apiClient.get(`/customers?search=${query}&pageSize=5`);
    
    // Search suppliers
    const suppliers = await apiClient.get(`/suppliers?search=${query}&pageSize=5`);
    
    // Search purchases
    const purchases = await apiClient.get(`/purchases?search=${query}&pageSize=5`);
    
    // Search sales
    const sales = await apiClient.get(`/sales?search=${query}&pageSize=5`);
    
    return {
      products,
      customers,
      suppliers,
      purchases,
      sales,
    };
  },
};

export const productOptions = async () => {
  const products = await apiClient.get('/products?status=Active');
  return products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku}) — Stock: ${p.stock}` }));
};

export const categoryOptions = async () => {
  const categories = await apiClient.get('/categories');
  return categories.map((c) => ({ value: c.id, label: c.name }));
};

// Warehouses
export const warehousesApi = {
  list: async () => {
    return apiClient.get('/warehouses');
  },

  get: async (id) => {
    return apiClient.get(`/warehouses/${id}`);
  },

  create: async (data) => {
    return apiClient.post('/warehouses', data);
  },

  update: async (id, data) => {
    return apiClient.put(`/warehouses/${id}`, data);
  },

  delete: async (id) => {
    return apiClient.delete(`/warehouses/${id}`);
  },

  options: async () => {
    const result = await apiClient.get('/warehouses');
    return result.map((w) => ({ value: w.id, label: w.name }));
  },
};

// Serial Numbers
export const serialNumbersApi = {
  list: async ({ productId, status, page = 1, pageSize = 10 } = {}) => {
    // Placeholder - needs backend implementation
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  },
  create: async (data) => {
    // Placeholder - needs backend implementation
    return {};
  },
  update: async (id, data) => {
    // Placeholder - needs backend implementation
    return {};
  },
  delete: async (id) => {
    // Placeholder - needs backend implementation
    return { success: true };
  },
};

// Batches
export const batchesApi = {
  list: async ({ productId, status, page = 1, pageSize = 10 } = {}) => {
    // Placeholder - needs backend implementation
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  },
  create: async (data) => {
    // Placeholder - needs backend implementation
    return {};
  },
  update: async (id, data) => {
    // Placeholder - needs backend implementation
    return {};
  },
  delete: async (id) => {
    // Placeholder - needs backend implementation
    return { success: true };
  },
};

// Quotes
export const quotesApi = {
  list: async ({ status, page = 1, pageSize = 10 } = {}) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status) params.append('status', status);
    return apiClient.get(`/quotes?${params.toString()}`);
  },

  get: async (id) => {
    return apiClient.get(`/quotes/${id}`);
  },

  create: async (data) => {
    return apiClient.post('/quotes', data);
  },

  updateStatus: async (id, status) => {
    return apiClient.put(`/quotes/${id}/status`, { status });
  },

  delete: async (id) => {
    return apiClient.delete(`/quotes/${id}`);
  },
};

// Returns
export const returnsApi = {
  list: async ({ status, page = 1, pageSize = 10 } = {}) => {
    // Placeholder - needs backend implementation
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  },
  get: async (id) => {
    // Placeholder - needs backend implementation
    return {};
  },
  create: async (data) => {
    // Placeholder - needs backend implementation
    return {};
  },
  update: async (id, data) => {
    // Placeholder - needs backend implementation
    return {};
  },
  delete: async (id) => {
    // Placeholder - needs backend implementation
    return { success: true };
  },
};

// Invoices
export const invoicesApi = {
  list: async ({ status, page = 1, pageSize = 10 } = {}) => {
    // Placeholder - needs backend implementation
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  },
  get: async (id) => {
    // Placeholder - needs backend implementation
    return {};
  },
  create: async (data) => {
    // Placeholder - needs backend implementation
    return {};
  },
  update: async (id, data) => {
    // Placeholder - needs backend implementation
    return {};
  },
  markAsPaid: async (id) => {
    // Placeholder - needs backend implementation
    return {};
  },
  delete: async (id) => {
    // Placeholder - needs backend implementation
    return { success: true };
  },
};

// Users & RBAC
export const usersApi = {
  list: async () => {
    return apiClient.get('/users');
  },

  get: async (id) => {
    return apiClient.get(`/users/${id}`);
  },

  create: async (data) => {
    return apiClient.post('/users', data);
  },

  update: async (id, data) => {
    return apiClient.put(`/users/${id}`, data);
  },

  delete: async (id) => {
    return apiClient.delete(`/users/${id}`);
  },
};

export const rolesApi = {
  list: async () => {
    // Placeholder - needs backend implementation
    return [];
  },
  get: async (id) => {
    // Placeholder - needs backend implementation
    return {};
  },
  create: async (data) => {
    // Placeholder - needs backend implementation
    return {};
  },
  update: async (id, data) => {
    // Placeholder - needs backend implementation
    return {};
  },
  delete: async (id) => {
    // Placeholder - needs backend implementation
    return { success: true };
  },
};

export const auditLogsApi = {
  list: async ({ userId, action, entity, page = 1, pageSize = 20 } = {}) => {
    // Placeholder - needs backend implementation
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  },
  create: async (data) => {
    // Placeholder - needs backend implementation
    return {};
  },
};
