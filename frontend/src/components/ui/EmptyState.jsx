import React from 'react';
import { Package, Search, Users, ShoppingCart, FileText, AlertCircle } from 'lucide-react';

export default function EmptyState({ type = 'default', message, action }) {
  const icons = {
    default: Package,
    products: Package,
    customers: Users,
    orders: ShoppingCart,
    documents: FileText,
    search: Search,
    error: AlertCircle,
  };

  const Icon = icons[type] || icons.default;

  const messages = {
    default: 'No data available',
    products: 'No products found',
    customers: 'No customers found',
    orders: 'No orders found',
    documents: 'No documents found',
    search: 'No results found',
    error: 'Something went wrong',
  };

  const defaultMessage = messages[type] || messages.default;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-4">{message || defaultMessage}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
