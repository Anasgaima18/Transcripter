import React, { createContext, useContext, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

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
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

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

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const Container = styled.div`
  position: fixed; top: 2rem; right: 2rem; z-index: 10000;
  display: flex; flex-direction: column; gap: 0.75rem; pointer-events: none;
`;

const ToastItem = styled.div`
  background: #fff; border: 1px solid #e2e8f0; border-left-width: 4px; border-radius: 0.75rem;
  box-shadow: 0 12px 32px rgba(2,6,23,0.15);
  padding: 1rem; display: flex; align-items: center; gap: 0.75rem;
  min-width: 300px; max-width: 450px; pointer-events: auto;
  transition: transform 160ms ease; animation: ${slideIn} 240ms ease both;
  &:hover { transform: translateX(-4px); }
  border-left-color: ${(p) => ({ success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }[p.$type] || '#64748b')};
`;

const Icon = styled.div`
  font-size: 1.25rem; flex-shrink: 0;
`;

const Title = styled.div`
  font-weight: 600; color: #0f172a; margin-bottom: 0.125rem; font-size: 0.9rem;
`;

const Message = styled.div`
  color: #475569; font-size: 0.9rem;
`;

const Close = styled.button`
  color: #94a3b8; font-size: 1.125rem; padding: 0.25rem; border: 0; background: transparent; cursor: pointer;
  transition: color 160ms ease; &:hover { color: #475569; }
`;

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  const getTitle = (type) => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      default:
        return 'Notification';
    }
  };

  return (
    <Container>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} $type={toast.type}>
          <Icon>{getIcon(toast.type)}</Icon>
          <div style={{ flex: 1 }}>
            <Title>{getTitle(toast.type)}</Title>
            <Message>{toast.message}</Message>
          </div>
          <Close onClick={() => removeToast(toast.id)} aria-label="Close">×</Close>
        </ToastItem>
      ))}
    </Container>
  );
};

export default ToastProvider;
