import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import Button from './Button';
import Input from './Input';

const SearchFilter = ({
  onSearch,
  onFilter,
  searchPlaceholder = 'Search...',
  filters = [],
  showAdvanced = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState(
    filters.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue || '' }), {})
  );

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key, value) => {
    const newValues = { ...filterValues, [key]: value };
    setFilterValues(newValues);
    onFilter?.(newValues);
  };

  const handleClearAll = () => {
    setSearchTerm('');
    const cleared = filters.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue || '' }), {});
    setFilterValues(cleared);
    onSearch?.('');
    onFilter?.(cleared);
  };

  const activeFilterCount = Object.values(filterValues).filter(v => v !== '' && v !== null).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-2.5 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && filters.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          {filters.map((filter) => (
            <div key={filter.key} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All {filter.label}</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === 'date' ? (
                <input
                  type="date"
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <input
                  type={filter.type || 'text'}
                  placeholder={filter.placeholder}
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              )}
            </div>
          ))}
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="w-full"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
