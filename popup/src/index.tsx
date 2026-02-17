import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById("root")!);
root.render(
  <>
    <App />
    <Toaster 
      position="top-right" 
      richColors 
      toastOptions={{
        className: 'border border-gray-200 shadow-lg',
        style: { fontSize: '14px' }
      }}
    />
  </>
);