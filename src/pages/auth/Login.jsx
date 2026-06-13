import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    await login(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">Sign in to your account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-primary" {...register('remember')} />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          Don’t have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
