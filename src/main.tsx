import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register PWA service worker with immediate update handling
registerSW({
  immediate: true,
  onNeedRefresh() {
    // Auto-update to latest version without stale cache
    window.location.reload();
  },
  onOfflineReady() {
    console.log('STOCKLITE siap digunakan secara offline');
  }
});

createRoot(document.getElementById('root')!).render(<App />);
