import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useApi } from '../../hooks/useApi';
import { settingsApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Settings() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [resetOpen, setResetOpen] = React.useState(false);

  const { data: settings, loading } = useApi(() => settingsApi.get(), [version]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const onSubmit = async (data) => {
    try {
      await settingsApi.update({
        ...data,
        taxRate: Number(data.taxRate),
        lowStockThreshold: Number(data.lowStockThreshold),
      });
      addToast({ title: 'Settings saved', type: 'success' });
      refresh();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const handleReset = async () => {
    try {
      await settingsApi.resetData();
      addToast({ title: 'Demo data reset to defaults', type: 'success' });
      refresh();
      window.location.reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Settings</h2>

      <Card title="Account">
        <div className="text-sm space-y-1">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role || 'admin'}</p>
          <p><strong>Company:</strong> {user?.company || settings?.companyName}</p>
        </div>
      </Card>

      <Card title="Company Information">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="companyName" label="Company Name" error={errors.companyName?.message}
            {...register('companyName', { required: 'Required' })} />
          <Input id="email" label="Company Email" type="email" {...register('email')} />
          <Input id="phone" label="Phone" {...register('phone')} />
          <Input id="address" label="Address" {...register('address')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select id="currency" label="Currency"
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
              ]}
              {...register('currency')} />
            <Input id="taxRate" label="Tax Rate (%)" type="number" step="0.01"
              {...register('taxRate')} />
            <Input id="lowStockThreshold" label="Default Low Stock Threshold" type="number"
              {...register('lowStockThreshold')} />
            <Select id="timezone" label="Timezone"
              options={[
                { value: 'America/Chicago', label: 'Central (US)' },
                { value: 'America/New_York', label: 'Eastern (US)' },
                { value: 'America/Los_Angeles', label: 'Pacific (US)' },
                { value: 'Europe/London', label: 'London' },
              ]}
              {...register('timezone')} />
          </div>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Settings'}</Button>
        </form>
      </Card>

      <Card title="Appearance">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Current theme: <strong>{theme}</strong>
        </p>
        <Button variant="secondary" onClick={toggleTheme}>Toggle Dark / Light Mode</Button>
      </Card>

      <Card title="Demo Data">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Reset all inventory data to the default demo dataset. This cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setResetOpen(true)}>Reset Demo Data</Button>
      </Card>

      <Card title="Demo Credentials">
        <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
          <p><strong>Admin:</strong> admin@demo.com / admin123</p>
          <p><strong>Manager:</strong> manager@demo.com / manager123</p>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title="Reset Demo Data"
        message="This will erase all changes and restore the default demo dataset. Continue?"
      />
    </div>
  );
}
