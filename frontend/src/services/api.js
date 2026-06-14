import apiClient from './apiClient';

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
    const params = new URLSearchParams({ search: String(search), page: String(page), pageSize: String(pageSize) });
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

// Warehouses
export const warehousesApi = {
  list: withStoreRead((store) => store.warehouses),
  get: withStoreRead((store, id) => {
    const warehouse = store.warehouses.find((w) => w.id === Number(id));
    if (!warehouse) throw new Error('Warehouse not found');
    return warehouse;
  }),
  create: withStore((store, data) => {
    const warehouse = {
      id: getNextId(store, 'warehouse'),
      name: data.name,
      location: data.location,
      isDefault: data.isDefault || false,
    };
    if (warehouse.isDefault) {
      store.warehouses.forEach((w) => w.isDefault = false);
    }
    store.warehouses.push(warehouse);
    return warehouse;
  }),
  update: withStore((store, id, data) => {
    const warehouse = store.warehouses.find((w) => w.id === Number(id));
    if (!warehouse) throw new Error('Warehouse not found');
    Object.assign(warehouse, data);
    if (warehouse.isDefault) {
      store.warehouses.forEach((w) => w.id !== warehouse.id && (w.isDefault = false));
    }
    return warehouse;
  }),
  delete: withStore((store, id) => {
    const warehouse = store.warehouses.find((w) => w.id === Number(id));
    if (!warehouse) throw new Error('Warehouse not found');
    if (warehouse.isDefault) throw new Error('Cannot delete default warehouse');
    if (store.products.some((p) => p.warehouseId === warehouse.id)) {
      throw new Error('Cannot delete warehouse with assigned products');
    }
    store.warehouses = store.warehouses.filter((w) => w.id !== Number(id));
    return { success: true };
  }),
  options: withStoreRead((store) =>
    store.warehouses.map((w) => ({ value: w.id, label: w.name }))
  ),
};

// Serial Numbers
export const serialNumbersApi = {
  list: withStoreRead((store, { productId, status, page = 1, pageSize = 10 } = {}) => {
    let items = store.serialNumbers.map((sn) => {
      const product = store.products.find((p) => p.id === sn.productId);
      const warehouse = store.warehouses.find((w) => w.id === sn.warehouseId);
      return {
        ...sn,
        productName: product?.name || 'Unknown',
        warehouseName: warehouse?.name || 'Unknown',
      };
    });
    if (productId) items = items.filter((sn) => sn.productId === Number(productId));
    if (status) items = items.filter((sn) => sn.status === status);
    return paginate(items, page, pageSize);
  }),
  create: withStore((store, data) => {
    const serial = {
      id: getNextId(store, 'serialNumber'),
      productId: Number(data.productId),
      serialNumber: data.serialNumber,
      status: data.status || 'in_stock',
      purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
      warehouseId: Number(data.warehouseId || 1),
      saleId: data.saleId || null,
    };
    if (store.serialNumbers.some((s) => s.serialNumber === serial.serialNumber)) {
      throw new Error('Serial number already exists');
    }
    store.serialNumbers.push(serial);
    return serial;
  }),
  update: withStore((store, id, data) => {
    const serial = store.serialNumbers.find((s) => s.id === Number(id));
    if (!serial) throw new Error('Serial number not found');
    Object.assign(serial, data);
    return serial;
  }),
  delete: withStore((store, id) => {
    store.serialNumbers = store.serialNumbers.filter((s) => s.id !== Number(id));
    return { success: true };
  }),
};

// Batches
export const batchesApi = {
  list: withStoreRead((store, { productId, status, page = 1, pageSize = 10 } = {}) => {
    let items = store.batches.map((b) => {
      const product = store.products.find((p) => p.id === b.productId);
      const warehouse = store.warehouses.find((w) => w.id === b.warehouseId);
      return {
        ...b,
        productName: product?.name || 'Unknown',
        warehouseName: warehouse?.name || 'Unknown',
      };
    });
    if (productId) items = items.filter((b) => b.productId === Number(productId));
    if (status) items = items.filter((b) => b.status === status);
    return paginate(items, page, pageSize);
  }),
  create: withStore((store, data) => {
    const batch = {
      id: getNextId(store, 'batch'),
      productId: Number(data.productId),
      batchNumber: data.batchNumber,
      quantity: Number(data.quantity),
      expirationDate: data.expirationDate,
      warehouseId: Number(data.warehouseId || 1),
      status: data.status || 'in_stock',
    };
    if (store.batches.some((b) => b.batchNumber === batch.batchNumber)) {
      throw new Error('Batch number already exists');
    }
    store.batches.push(batch);
    return batch;
  }),
  update: withStore((store, id, data) => {
    const batch = store.batches.find((b) => b.id === Number(id));
    if (!batch) throw new Error('Batch not found');
    Object.assign(batch, data);
    return batch;
  }),
  delete: withStore((store, id) => {
    store.batches = store.batches.filter((b) => b.id !== Number(id));
    return { success: true };
  }),
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
  list: withStoreRead((store, { status, page = 1, pageSize = 10 } = {}) => {
    let items = store.returns.map((r) => {
      const customer = store.customers.find((c) => c.id === r.customerId);
      const sale = store.sales.find((s) => s.id === r.saleId);
      return {
        ...r,
        customerName: customer?.name || 'Unknown',
        saleId: r.saleId,
      };
    });
    if (status) items = items.filter((r) => r.status === status);
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return paginate(items, page, pageSize);
  }),
  get: withStoreRead((store, id) => {
    const returnRecord = store.returns.find((r) => r.id === Number(id));
    if (!returnRecord) throw new Error('Return not found');
    const customer = store.customers.find((c) => c.id === returnRecord.customerId);
    const items = returnRecord.items.map((item) => {
      const product = store.products.find((p) => p.id === item.productId);
      return {
        ...item,
        productName: product?.name || 'Unknown',
      };
    });
    return {
      ...returnRecord,
      customerName: customer?.name || 'Unknown',
      items,
    };
  }),
  create: withStore((store, data) => {
    const returnRecord = {
      id: getNextId(store, 'return'),
      saleId: Number(data.saleId),
      customerId: Number(data.customerId),
      status: data.status || 'pending',
      items: data.items.map((i) => ({
        productId: Number(i.productId),
        quantity: Number(i.quantity),
        reason: i.reason,
      })),
      refundAmount: Number(data.refundAmount || 0),
      createdAt: new Date().toISOString(),
      notes: data.notes || '',
    };
    store.returns.unshift(returnRecord);
    return returnRecord;
  }),
  update: withStore((store, id, data) => {
    const returnRecord = store.returns.find((r) => r.id === Number(id));
    if (!returnRecord) throw new Error('Return not found');
    const prevStatus = returnRecord.status;
    Object.assign(returnRecord, {
      status: data.status || returnRecord.status,
      refundAmount: data.refundAmount !== undefined ? Number(data.refundAmount) : returnRecord.refundAmount,
      notes: data.notes !== undefined ? data.notes : returnRecord.notes,
    });
    if (data.status === 'approved' && prevStatus !== 'approved') {
      returnRecord.items.forEach((item) => {
        recordMovement(store, {
          type: 'in',
          productId: item.productId,
          quantity: item.quantity,
          reason: `Return #${returnRecord.id} approved`,
          reference: `RET-${returnRecord.id}`,
        });
      });
    }
    return returnRecord;
  }),
  delete: withStore((store, id) => {
    store.returns = store.returns.filter((r) => r.id !== Number(id));
    return { success: true };
  }),
};

// Invoices
export const invoicesApi = {
  list: withStoreRead((store, { status, page = 1, pageSize = 10 } = {}) => {
    let items = store.invoices.map((inv) => {
      const customer = store.customers.find((c) => c.id === inv.customerId);
      const sale = store.sales.find((s) => s.id === inv.saleId);
      return {
        ...inv,
        customerName: customer?.name || 'Unknown',
        saleId: inv.saleId,
      };
    });
    if (status) items = items.filter((inv) => inv.status === status);
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return paginate(items, page, pageSize);
  }),
  get: withStoreRead((store, id) => {
    const invoice = store.invoices.find((inv) => inv.id === Number(id));
    if (!invoice) throw new Error('Invoice not found');
    const customer = store.customers.find((c) => c.id === invoice.customerId);
    const sale = store.sales.find((s) => s.id === invoice.saleId);
    const items = sale?.items?.map((item) => {
      const product = store.products.find((p) => p.id === item.productId);
      return {
        ...item,
        productName: product?.name || 'Unknown',
        lineTotal: item.quantity * item.unitPrice,
      };
    }) || [];
    return {
      ...invoice,
      customerName: customer?.name || 'Unknown',
      items,
    };
  }),
  create: withStore((store, data) => {
    const invoice = {
      id: getNextId(store, 'invoice'),
      saleId: Number(data.saleId),
      customerId: Number(data.customerId),
      status: data.status || 'pending',
      total: Number(data.total),
      dueDate: data.dueDate || '',
      paidDate: data.paidDate || null,
      createdAt: new Date().toISOString(),
      notes: data.notes || '',
    };
    store.invoices.unshift(invoice);
    return invoice;
  }),
  update: withStore((store, id, data) => {
    const invoice = store.invoices.find((inv) => inv.id === Number(id));
    if (!invoice) throw new Error('Invoice not found');
    Object.assign(invoice, {
      status: data.status || invoice.status,
      total: data.total !== undefined ? Number(data.total) : invoice.total,
      dueDate: data.dueDate || invoice.dueDate,
      paidDate: data.paidDate !== undefined ? data.paidDate : invoice.paidDate,
      notes: data.notes !== undefined ? data.notes : invoice.notes,
    });
    return invoice;
  }),
  markAsPaid: withStore((store, id) => {
    const invoice = store.invoices.find((inv) => inv.id === Number(id));
    if (!invoice) throw new Error('Invoice not found');
    invoice.status = 'paid';
    invoice.paidDate = new Date().toISOString().split('T')[0];
    return invoice;
  }),
  delete: withStore((store, id) => {
    store.invoices = store.invoices.filter((inv) => inv.id !== Number(id));
    return { success: true };
  }),
};

// Users & RBAC
export const usersApi = {
  list: withStoreRead((store) => {
    return store.users.map((u) => ({
      ...u,
      password: undefined,
    }));
  }),
  get: withStoreRead((store, id) => {
    const user = store.users.find((u) => u.id === Number(id));
    if (!user) throw new Error('User not found');
    const { password, ...safe } = user;
    return safe;
  }),
  create: withStore((store, data) => {
    if (store.users.some((u) => u.email === data.email)) {
      throw new Error('Email already registered');
    }
    const user = {
      id: getNextId(store, 'user'),
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role || 'staff',
      company: data.company || store.settings.companyName,
      permissions: data.permissions || [],
      status: data.status || 'active',
    };
    store.users.push(user);
    const { password: _, ...safe } = user;
    return safe;
  }),
  update: withStore((store, id, data) => {
    const user = store.users.find((u) => u.id === Number(id));
    if (!user) throw new Error('User not found');
    Object.assign(user, {
      name: data.name || user.name,
      role: data.role || user.role,
      permissions: data.permissions || user.permissions,
      status: data.status !== undefined ? data.status : user.status,
    });
    if (data.password) user.password = data.password;
    const { password, ...safe } = user;
    return safe;
  }),
  delete: withStore((store, id) => {
    const user = store.users.find((u) => u.id === Number(id));
    if (!user) throw new Error('User not found');
    if (user.role === 'admin' && store.users.filter((u) => u.role === 'admin').length === 1) {
      throw new Error('Cannot delete the last admin user');
    }
    store.users = store.users.filter((u) => u.id !== Number(id));
    return { success: true };
  }),
};

export const rolesApi = {
  list: withStoreRead((store) => store.roles),
  get: withStoreRead((store, id) => {
    const role = store.roles.find((r) => r.id === Number(id));
    if (!role) throw new Error('Role not found');
    return role;
  }),
  create: withStore((store, data) => {
    const role = {
      id: getNextId(store, 'role'),
      name: data.name,
      description: data.description || '',
      permissions: data.permissions || [],
    };
    store.roles.push(role);
    return role;
  }),
  update: withStore((store, id, data) => {
    const role = store.roles.find((r) => r.id === Number(id));
    if (!role) throw new Error('Role not found');
    Object.assign(role, {
      name: data.name || role.name,
      description: data.description !== undefined ? data.description : role.description,
      permissions: data.permissions || role.permissions,
    });
    return role;
  }),
  delete: withStore((store, id) => {
    const role = store.roles.find((r) => r.id === Number(id));
    if (!role) throw new Error('Role not found');
    if (store.users.some((u) => u.role === role.name.toLowerCase())) {
      throw new Error('Cannot delete role with assigned users');
    }
    store.roles = store.roles.filter((r) => r.id !== Number(id));
    return { success: true };
  }),
};

export const auditLogsApi = {
  list: withStoreRead((store, { userId, action, entity, page = 1, pageSize = 20 } = {}) => {
    let items = store.auditLogs.map((log) => {
      const user = store.users.find((u) => u.id === log.userId);
      return {
        ...log,
        userName: user?.name || 'Unknown',
      };
    });
    if (userId) items = items.filter((log) => log.userId === Number(userId));
    if (action) items = items.filter((log) => log.action === action);
    if (entity) items = items.filter((log) => log.entity === entity);
    items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return paginate(items, page, pageSize);
  }),
  create: withStore((store, data) => {
    const log = {
      id: getNextId(store, 'auditLog'),
      userId: Number(data.userId),
      action: data.action,
      entity: data.entity,
      entityId: Number(data.entityId),
      details: data.details || '',
      timestamp: new Date().toISOString(),
    };
    store.auditLogs.unshift(log);
    return log;
  }),
};
