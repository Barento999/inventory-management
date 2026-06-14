import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import { useApi } from '../../hooks/useApi';
import { productsApi, categoryOptions, warehousesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { Plus, X } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = id === 'create';
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [variants, setVariants] = useState([{ name: '', options: [''] }]);
  const [uploadedImages, setUploadedImages] = useState([]);

  const { data: product, loading } = useApi(
    () => (isCreate ? Promise.resolve(null) : productsApi.get(id)),
    [id]
  );
  const { data: categories } = useApi(() => categoryOptions(), []);
  const { data: warehouses } = useApi(() => warehousesApi.options(), []);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || '',
        categoryId: product.categoryId,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        reorderLevel: product.reorderLevel,
        status: product.status,
        image: product.image,
        description: product.description,
        trackSerial: product.trackSerial || false,
        trackExpiration: product.trackExpiration || false,
        expirationDays: product.expirationDays || '',
        warehouseId: product.warehouseId || 1,
      });
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
      }
    } else if (isCreate) {
      reset({ status: 'Active', stock: 0, reorderLevel: 10, cost: 0, price: 0, trackSerial: false, trackExpiration: false, warehouseId: 1 });
    }
  }, [product, isCreate, reset, warehouses]);

  const addVariant = () => {
    setVariants([...variants, { name: '', options: [''] }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addVariantOption = (variantIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options.push('');
    setVariants(newVariants);
  };

  const removeVariantOption = (variantIndex, optionIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options = newVariants[variantIndex].options.filter((_, i) => i !== optionIndex);
    setVariants(newVariants);
  };

  const updateVariantName = (index, name) => {
    const newVariants = [...variants];
    newVariants[index].name = name;
    setVariants(newVariants);
  };

  const updateVariantOption = (variantIndex, optionIndex, value) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options[optionIndex] = value;
    setVariants(newVariants);
  };

  const onSubmit = async (data) => {
    try {
      const submitData = { ...data, variants };
      if (isCreate) {
        const created = await productsApi.create(submitData);
        addToast({ title: 'Product created', type: 'success' });
        refresh();
        navigate(`/products/${created.id}`);
      } else {
        await productsApi.update(id, submitData);
        addToast({ title: 'Product updated', type: 'success' });
        refresh();
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  if (loading && !isCreate) return <Loader className="py-12" />;
  if (!isCreate && !loading && !product) return <p>Product not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{isCreate ? 'Add Product' : 'Edit Product'}</h2>
        <Link to="/products" className="text-sm text-primary hover:underline">Back to list</Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="name" label="Product Name" error={errors.name?.message}
              {...register('name', { required: 'Name is required' })} />
            <Input id="sku" label="SKU" error={errors.sku?.message}
              {...register('sku', { required: 'SKU is required' })} />
            <Input id="barcode" label="Barcode" placeholder="Scan or enter barcode"
              {...register('barcode')} />
            <Select id="categoryId" label="Category" error={errors.categoryId?.message}
              options={[{ value: '', label: 'Select category' }, ...(categories || [])]}
              {...register('categoryId', { required: 'Category is required' })} />
            <Select id="warehouseId" label="Warehouse"
              options={warehouses || []}
              {...register('warehouseId')} />
            <Select id="status" label="Status"
              options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
              {...register('status')} />
            <Input id="price" label="Sell Price" type="number" step="0.01" error={errors.price?.message}
              {...register('price', { required: 'Price is required', min: 0 })} />
            <Input id="cost" label="Cost Price" type="number" step="0.01"
              {...register('cost', { min: 0 })} />
            {isCreate && (
              <Input id="stock" label="Initial Stock" type="number"
                {...register('stock', { min: 0 })} />
            )}
            <Input id="reorderLevel" label="Reorder Level" type="number"
              {...register('reorderLevel', { min: 0 })} />
            <Input id="image" label="Image URL" className="md:col-span-2"
              {...register('image')} />
          </div>

          <Button type="button" variant="secondary" onClick={() => setShowImageUpload(!showImageUpload)} className="w-full">
            {showImageUpload ? 'Hide' : 'Show'} Image Upload
          </Button>

          {showImageUpload && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <FileUpload
                accept="image/*"
                multiple={true}
                onUpload={(files) => {
                  setUploadedImages(files);
                  addToast({ title: `${files.length} image(s) uploaded`, type: 'success' });
                }}
              />
            </div>
          )}

          <Input id="description" label="Description"
            {...register('description')} />

          <Button type="button" variant="secondary" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full">
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="trackSerial" {...register('trackSerial')} className="rounded" />
                <label htmlFor="trackSerial" className="text-sm">Track Serial Numbers</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="trackExpiration" {...register('trackExpiration')} className="rounded" />
                <label htmlFor="trackExpiration" className="text-sm">Track Expiration Dates</label>
              </div>
              <Input id="expirationDays" label="Expiration Days (if tracked)" type="number"
                {...register('expirationDays', { min: 1 })} />
            </div>
          )}

          <Button type="button" variant="secondary" onClick={() => setShowVariants(!showVariants)} className="w-full">
            {showVariants ? 'Hide' : 'Show'} Product Variants
          </Button>

          {showVariants && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Add product variants like size, color, etc.</p>
              {variants.map((variant, vIndex) => (
                <div key={vIndex} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Variant name (e.g., Color, Size)"
                      value={variant.name}
                      onChange={(e) => updateVariantName(vIndex, e.target.value)}
                      className="flex-1"
                    />
                    {variants.length > 1 && (
                      <Button type="button" variant="secondary" size="sm" onClick={() => removeVariant(vIndex)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {variant.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <Input
                          placeholder="Option (e.g., Red, XL)"
                          value={option}
                          onChange={(e) => updateVariantOption(vIndex, oIndex, e.target.value)}
                          className="flex-1"
                        />
                        {variant.options.length > 1 && (
                          <Button type="button" variant="secondary" size="sm" onClick={() => removeVariantOption(vIndex, oIndex)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={() => addVariantOption(vIndex)}>
                      <Plus className="w-4 h-4 mr-1" /> Add Option
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addVariant}>
                <Plus className="w-4 h-4 mr-1" /> Add Variant
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isCreate ? 'Create Product' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/products')}>Cancel</Button>
          </div>
        </form>
      </Card>

      {!isCreate && product && (
        <Card title="Preview">
          <div className="flex gap-4">
            <img src={product.image} alt={product.name} className="w-24 h-24 rounded object-cover" />
            <div className="text-sm space-y-1">
              <p><strong>Current stock:</strong> {product.stock}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Barcode:</strong> {product.barcode || 'Not set'}</p>
              <p><strong>Value:</strong> ${(product.stock * product.cost).toFixed(2)}</p>
              <p><strong>Track Serial:</strong> {product.trackSerial ? 'Yes' : 'No'}</p>
              <p><strong>Track Expiration:</strong> {product.trackExpiration ? 'Yes' : 'No'}</p>
              <p><strong>Variants:</strong> {product.variants?.length || 0}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
