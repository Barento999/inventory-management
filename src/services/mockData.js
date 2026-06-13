// Mock data and simple async helpers

const mockProducts = [
  {
    id: 1,
    image: 'https://via.placeholder.com/80',
    name: 'Sample Product 1',
    sku: 'SP001',
    category: 'Category A',
    price: 49.99,
    stock: 120,
    status: 'Active',
  },
  {
    id: 2,
    image: 'https://via.placeholder.com/80',
    name: 'Sample Product 2',
    sku: 'SP002',
    category: 'Category B',
    price: 29.99,
    stock: 45,
    status: 'Active',
  },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMockData(endpoint) {
  await delay(300);
  switch (endpoint) {
    case '/summary':
      return {
        totalProducts: mockProducts.length,
        totalSales: 542,
        totalRevenue: 12450,
        lowStockItems: mockProducts.filter((p) => p.stock < 50).length,
        totalCustomers: 85,
        totalSuppliers: 7,
      };
    case '/products':
      return mockProducts;
    default:
      if (endpoint.startsWith('/products/')) {
        const id = parseInt(endpoint.split('/')[2], 10);
        return mockProducts.find((p) => p.id === id) || null;
      }
      return [];
  }
}

export async function mockLogin(email, password) {
  await delay(200);
  if (email && password) {
    return { id: 1, name: email.split('@')[0], email };
  }
  throw new Error('Invalid credentials');
}

export async function mockRegister(data) {
  await delay(200);
  if (data.email) {
    return { id: Date.now(), ...data };
  }
  throw new Error('Registration failed');
}
