/**
 * Service Worker Registration untuk STOCKLITE PWA
 * Manual registration untuk offline support yang stabil dan terprediksi
 */

export async function registerServiceWorker() {
  // Hanya register di production atau HTTPS
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Worker tidak didukung di browser ini');
    return false;
  }

  try {
    // Hanya register di HTTPS atau localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isHttps = window.location.protocol === 'https:';

    if (!isLocalhost && !isHttps) {
      console.warn('[PWA] Service Worker hanya berfungsi di HTTPS atau localhost');
      return false;
    }

    // Register manual service worker dengan scope root
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none', // Selalu check update dari server
    });

    console.log('[PWA] Service Worker registered successfully:', registration);

    // Cek update setiap kali halaman dimuat
    registration.update();

    // Listen untuk update tersedia
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Update tersedia
            console.log('[PWA] Update tersedia, refresh halaman untuk menggunakan versi terbaru');
          }
        });
      }
    });

    return true;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return false;
  }
}
