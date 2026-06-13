import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Register() {
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    await registerUser(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">Create your account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="company"
            label="Company Name"
            error={errors.company?.message}
            {...register('company', { required: 'Company name required' })}
          />
          <Input
            id="fullName"
            label="Full Name"
            error={errors.fullName?.message}
            {...register('fullName', { required: 'Full name required' })}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email', { required: 'Email required' })}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
          />
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
