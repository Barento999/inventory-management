import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * Enhanced validation feedback for forms
 * Integrates with react-hook-form for seamless error display
 */
export default function FormValidator({ children, formState, isDirty }) {
  const errorCount = Object.keys(formState.errors || {}).length;
  const hasErrors = errorCount > 0;

  return (
    <>
      {/* Form-level error summary */}
      {hasErrors && isDirty && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 dark:text-red-100">
                Form has {errorCount} error{errorCount !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                Please fix the issues below before submitting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form content */}
      {children}

      {/* Success feedback */}
      {isDirty && !hasErrors && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300">
            ✓ All fields look good. Ready to submit.
          </p>
        </div>
      )}
    </>
  );
}

/**
 * Field error display helper
 */
export function FieldError({ error }) {
  if (!error) return null;

  const message = error.message || 'Invalid field';
  const type = error.type;

  let icon = <AlertCircle className="w-4 h-4" />;
  let hint = '';

  switch (type) {
    case 'required':
      hint = 'This field is required';
      break;
    case 'pattern':
      hint = 'Invalid format';
      break;
    case 'min':
      hint = `Minimum value: ${error.ref?.min || 'N/A'}`;
      break;
    case 'max':
      hint = `Maximum value: ${error.ref?.max || 'N/A'}`;
      break;
    case 'minLength':
      hint = `Minimum ${error.ref?.minLength || 'N/A'} characters`;
      break;
    case 'maxLength':
      hint = `Maximum ${error.ref?.maxLength || 'N/A'} characters`;
      break;
    default:
      hint = message;
  }

  return (
    <div className="mt-1.5 p-2 bg-red-50 dark:bg-red-950 rounded flex items-start gap-2">
      {icon}
      <div className="text-xs text-red-600 dark:text-red-400">
        <p className="font-medium">{message}</p>
        {hint && hint !== message && (
          <p className="text-red-500 dark:text-red-300">{hint}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Success state display
 */
export function FieldSuccess() {
  return (
    <div className="mt-1.5 p-2 bg-green-50 dark:bg-green-950 rounded flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
      <p className="text-xs text-green-600 dark:text-green-400">Field validated</p>
    </div>
  );
}
