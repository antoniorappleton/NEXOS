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
      if (regs.length > 0) {
        console.log('Unregistering', regs.length, 'service worker(s)');
        await Promise.all(regs.map(r => r.unregister()));
        // Also attempt to clear the controller reference
        try { (navigator as any).serviceWorker?.controller?.postMessage?.({type:'clients-clear'}) } catch {}
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
})();
