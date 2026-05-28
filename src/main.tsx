import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Auto-unregister stray service workers (helps when visiting via GitHub Pages)
// Some older deployments or other scopes may have left a service-worker active
// which causes `Failed to fetch` or Cross-Origin-Opener-Policy issues. This
// proactively unregisters them on load so the app can run normally.
async function unregisterOldServiceWorkers() {
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      const ourScope = new URL('./', window.location.href).href;
      for (const r of regs) {
        if (r.scope !== ourScope) {
          console.log('Unregistering stray service worker scope:', r.scope);
          await r.unregister();
        }
      }
    } catch (err) {
      console.warn('Failed to unregister service workers', err);
    }
  }
}

(async () => {
  await unregisterOldServiceWorkers();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  // Register the new service worker (if available). Use relative path so it
  // works on GitHub Pages (`/NEXOS/service-worker.js`) and Firebase hosting.
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service worker registered:', reg);
    } catch (err) {
      console.warn('Service worker registration failed:', err);
    }
  }
})();
