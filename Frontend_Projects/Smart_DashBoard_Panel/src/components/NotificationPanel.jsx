import React from 'react';
import { Toaster } from 'react-hot-toast';

const NotificationPanel = () => {
  return (
    <Toaster
      position="top-right"
      containerStyle={{ top: '4.5rem', right: '1rem', zIndex: 9999 }}
      toastOptions={{
        duration: 4000,
        style: {
          minHeight: '56px',
          maxWidth: '420px',
          padding: '12px 16px',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          borderRadius: '12px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(255, 255, 255, 0.85)',
          color: '#0f172a',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.4)',
        },
        success: {
          duration: 3000,
          style: {
            minHeight: '56px',
            maxWidth: '420px',
            padding: '12px 16px',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            background: 'rgba(240, 253, 244, 0.92)',
            color: '#14532d',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 8px 32px rgba(34,197,94,0.15)',
          },
          iconTheme: {
            primary: '#16a34a',
            secondary: '#f0fdf4',
          },
        },
        error: {
          duration: 5000,
          style: {
            minHeight: '56px',
            maxWidth: '420px',
            padding: '12px 16px',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            background: 'rgba(254, 242, 242, 0.92)',
            color: '#7f1d1d',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 8px 32px rgba(239,68,68,0.15)',
          },
          iconTheme: {
            primary: '#dc2626',
            secondary: '#fef2f2',
          },
        },
      }}
    />
  );
};

export default NotificationPanel;