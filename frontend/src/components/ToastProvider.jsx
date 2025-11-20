import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  };

  const getTitle = (type) => {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Info';
      default: return 'Notification';
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success': return 'border-l-emerald-500';
      case 'error': return 'border-l-red-500';
      case 'warning': return 'border-l-amber-500';
      case 'info': return 'border-l-blue-500';
      default: return 'border-l-slate-500';
    }
  };

  return (
    <div className="fixed top-8 right-8 z-[10000] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-l-4 rounded-xl
            shadow-xl p-4 flex items-start gap-3 min-w-[300px] max-w-[450px] pointer-events-auto
            animate-slide-in hover:-translate-x-1 transition-transform duration-200
            ${getTypeStyles(toast.type)}
          `}
        >
          <div className="text-xl flex-shrink-0 leading-none mt-0.5">
            {getIcon(toast.type)}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5">
              {getTitle(toast.type)}
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm">
              {toast.message}
            </div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastProvider;
