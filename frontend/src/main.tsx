import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App';
import { useThemeStore } from '@/stores/themeStore';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

useThemeStore.getState();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);