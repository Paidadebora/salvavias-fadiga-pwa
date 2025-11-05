/* Service Worker: pré-cache para rodar offline após a primeira instalação */
const CACHE = 'fadiga-pwa-v1';
const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './src/app.js',
  './src/fatigue.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  // Bibliotecas remotas (cache após 1º acesso)
  'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_solution_packed_assets.data',
  'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_solution_packed_assets_loader.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_simd_wasm_bin.wasm'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if (PRECACHE.includes(url.href) || url.origin===location.origin) {
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
      const copy = resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return resp;
    })));
  }
});
