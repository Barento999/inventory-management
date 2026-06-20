import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { usersApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = id === 'create';
  const { refresh } = useDataRefresh();
  const { addToast } = useToast();

  const { data: user, loading } = useApi(
    () => (isCreate ? Promise.resolve(null) : usersApi.get(id)),
    [id]
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'viewer',
        status: user.status || 'active',
        company: user.company || '',
        department: user.department || '',
      });
    } else if (isCreate) {
      reset({
        name: '',
        email: '',
        password: '',
        role: 'viewer',
        status: 'active',
        company: '',
        department: '',
      });
    }
  }, [user, isCreate, reset]);

  const onSubmit = async (data) => {
    try {
      if (isCreate) {
        if (!data.password) {
          addToast({ title: 'Password is required', type: 'error' });
          return;
        }
        const created = await usersApi.create(data);
        addToast({ title: 'User created', type: 'success' });
        refresh();
        navigate(`/users/${created.id}`);
      } else {
        const updateData = { ...data };
        if (!updateData.password) {
          delete updateData.password;
        }
        await usersApi.update(id, updateData);
        addToast({ title: 'User updated', type: 'success' });
        refresh();
      }
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  if (loading && !isCreate) return <Loader className="py-12" />;
  if (!isCreate && !loading && !user) return <p>User not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{isCreate ? 'Add User' : 'Edit User'}</h2>
        <Link to="/users" className="text-sm text-primary hover:underline">Back to list</Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="name" label="Full Name" error={errors.name?.message}
              {...register('name', { required: 'Name is required' })} />
            <Input id="email" label="Email" type="email" error={errors.email?.message}
              {...register('email', { required: 'Email is required' })} />
            {isCreate && (
              <Input id="password" label="Password" type="password" error={errors.password?.message}
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })} />
            )}
            {!isCreate && (
              <Input id="password" label="New Password (leave blank to keep current)" type="password"
                {...register('password')} />
            )}
            <Select id="role" label="Role" error={errors.role?.message}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'manager', label: 'Manager' },
                { value: 'staff', label: 'Staff' },
                { value: 'viewer', label: 'Viewer' },
              ]}
              {...register('role', { required: 'Role is required' })} />
            <Select id="status" label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              {...register('status')} />
            <Input id="company" label="Company"
              {...register('company')} />
            <Input id="department" label="Department"
              {...register('department')} />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isCreate ? 'Create User' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/users')}>Cancel</Button>
          </div>
        </form>
      </Card>

      {!isCreate && user && (
        <Card title="User Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Role</p>
              <Badge variant={user.role === 'admin' ? 'primary' : 'default'}>{user.role}</Badge>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <Badge variant={user.status === 'active' ? 'success' : 'warning'}>{user.status}</Badge>
            </div>
            <div>
              <p className="text-gray-600">Company</p>
              <p className="font-medium">{user.company || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Department</p>
              <p className="font-medium">{user.department || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Login</p>
              <p className="font-medium">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
