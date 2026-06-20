import { useForm } from 'react-hook-form';
import { useCallback } from 'react';

/**
 * Enhanced useForm hook with validation feedback and error handling
 * Wraps react-hook-form with additional UX improvements
 */
export function useFormWithValidation(defaultValues = {}, onSubmit) {
  const form = useForm({
    defaultValues,
    mode: 'onBlur', // Validate on blur for better UX
    reValidateMode: 'onChange', // Re-validate on change after first blur
  });

  const handleSubmit = useCallback(
    async (data) => {
      try {
        await onSubmit(data);
      } catch (error) {
        console.error('Form submission error:', error);
        // Error is typically handled by the parent component via toast
        throw error;
      }
    },
    [onSubmit]
  );

  return {
    ...form,
    handleSubmit: form.handleSubmit(handleSubmit),
    hasErrors: Object.keys(form.formState.errors).length > 0,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
  };
}

/**
 * Validation rules helper
 */
export const validationRules = {
  email: {
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email address',
    },
  },
  phone: {
    pattern: {
      value: /^[0-9\s\-+()]+$/,
      message: 'Invalid phone number',
    },
  },
  url: {
    pattern: {
      value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w .-]*)*\/?$/,
      message: 'Invalid URL',
    },
  },
  zipCode: {
    pattern: {
      value: /^\d{5}(-\d{4})?$/,
      message: 'Invalid ZIP code',
    },
  },
  username: {
    minLength: { value: 3, message: 'Username must be at least 3 characters' },
    maxLength: { value: 20, message: 'Username must not exceed 20 characters' },
  },
  password: {
    minLength: { value: 8, message: 'Password must be at least 8 characters' },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Password must contain uppercase, lowercase, and numbers',
    },
  },
  sku: {
    pattern: {
      value: /^[A-Z0-9\-]+$/,
      message: 'SKU must contain only uppercase letters, numbers, and hyphens',
    },
  },
};
