import { Toaster as HotToaster, toast } from 'react-hot-toast';

/**
 * Toast notification system.
 *
 * Usage:
 *   import { showSuccess, showError, showInfo } from '@/components/Toast';
 *   showSuccess('Saved!');
 *   showError('Failed to save');
 */
export const showSuccess = (message: string) =>
  toast.success(message, { duration: 3000 });

export const showError = (message: string) =>
  toast.error(message, { duration: 5000 });

export const showInfo = (message: string) =>
  toast(message, { icon: 'ℹ️', duration: 3000 });

export const showWarning = (message: string) =>
  toast(message, { icon: '⚠️', duration: 4000 });

export const showLoading = (message: string) =>
  toast.loading(message);

export const dismissToast = (toastId: string) => toast.dismiss(toastId);

/**
 * Promise-based toast. Shows loading, then success/error.
 * Usage: showPromise(apiCall(), { loading: 'Saving...', success: 'Saved!', error: 'Failed' })
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string }
) =>
  toast.promise(promise, messages, {
    loading: { icon: '⏳' },
    success: { icon: '✅' },
    error: { icon: '❌' },
  });

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      gutter={8}
      toastOptions={{
        // Default styling
        style: {
          background: '#1f2937',
          color: '#fff',
          fontSize: '14px',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        },
        // Custom types
        success: {
          iconTheme: { primary: '#10b981', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
          duration: 5000,
        },
      }}
    />
  );
}
