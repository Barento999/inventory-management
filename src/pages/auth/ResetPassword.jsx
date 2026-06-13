import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    console.log('Reset token', token, 'new password', data.password);
    // Mock success – redirect to login
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">Reset Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="password"
            label="New Password"
            type="password"
            error={errors.password?.message}
            {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } })}
          />
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Confirm password required',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          Remembered?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
