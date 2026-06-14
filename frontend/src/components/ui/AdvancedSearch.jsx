import React, { useState } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import Modal from './Modal';
import { Search, Filter, X, Save, Clock } from 'lucide-react';

export default function AdvancedSearch({ onSearch, fields, entityType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState([]);
  const [savedSearches, setSavedSearches] = useState(() => {
    const saved = localStorage.getItem(`savedSearches_${entityType}`);
    return saved ? JSON.parse(saved) : [];
  });

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index, key, value) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onSearch({ searchTerm, filters });
    setIsOpen(false);
  };

  const handleSaveSearch = () => {
    const searchName = prompt('Enter a name for this search:');
    if (searchName) {
      const newSavedSearch = {
        id: Date.now(),
        name: searchName,
        searchTerm,
        filters,
        createdAt: new Date().toISOString(),
      };
      setSavedSearches([...savedSearches, newSavedSearch]);
      localStorage.setItem(`savedSearches_${entityType}`, JSON.stringify([...savedSearches, newSavedSearch]));
    }
  };

  const loadSavedSearch = (savedSearch) => {
    setSearchTerm(savedSearch.searchTerm);
    setFilters(savedSearch.filters);
    onSearch({ searchTerm: savedSearch.searchTerm, filters: savedSearch.filters });
    setIsOpen(false);
  };

  const deleteSavedSearch = (id) => {
    setSavedSearches(savedSearches.filter(s => s.id !== id));
    localStorage.setItem(`savedSearches_${entityType}`, JSON.stringify(savedSearches.filter(s => s.id !== id)));
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilters([]);
    onSearch({ searchTerm: '', filters: [] });
  };

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Not Contains' },
    { value: 'greaterThan', label: 'Greater Than' },
    { value: 'lessThan', label: 'Less Than' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
  ];

  return (
    <>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button variant="secondary" onClick={() => setIsOpen(true)}>
          <Filter className="w-4 h-4 mr-1" /> Filters
        </Button>
        {savedSearches.length > 0 && (
          <Select
            value=""
            onChange={(e) => {
              const search = savedSearches.find(s => s.id === Number(e.target.value));
              if (search) loadSavedSearch(search);
            }}
            options={[{ value: '', label: 'Saved Searches' }, ...savedSearches.map(s => ({ value: s.id, label: s.name }))]}
            className="w-40"
          />
        )}
        {(searchTerm || filters.length > 0) && (
          <Button variant="secondary" onClick={clearSearch}>
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Advanced Search">
        <div className="space-y-4">
          <Input
            id="searchTerm"
            label="Search Term"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter search term..."
          />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Filters</label>
              <Button size="sm" variant="secondary" onClick={addFilter}>
                <Filter className="w-4 h-4 mr-1" /> Add Filter
              </Button>
            </div>
            {filters.map((filter, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Select
                  value={filter.field}
                  onChange={(e) => updateFilter(index, 'field', e.target.value)}
                  options={[{ value: '', label: 'Select field' }, ...fields]}
                  className="flex-1"
                />
                <Select
                  value={filter.operator}
                  onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                  options={operators}
                  className="flex-1"
                />
                <Input
                  value={filter.value}
                  onChange={(e) => updateFilter(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1"
                />
                <Button size="sm" variant="danger" onClick={() => removeFilter(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch}>Search</Button>
            <Button variant="secondary" onClick={handleSaveSearch}>
              <Save className="w-4 h-4 mr-1" /> Save Search
            </Button>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>

          {savedSearches.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Saved Searches</h3>
              <div className="space-y-2">
                {savedSearches.map(search => (
                  <div key={search.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{search.name}</p>
                        <p className="text-xs text-gray-500">{new Date(search.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => loadSavedSearch(search)}>
                        Load
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => deleteSavedSearch(search.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
