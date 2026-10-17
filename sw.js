const C = "bls-v2";
const APP = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(APP)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== C).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const eigen = u.origin === location.origin;
  if (eigen && (e.request.mode === "navigate" || u.pathname.endsWith("/index.html") || u.pathname.endsWith("/"))) {
    e.respondWith(fetch(e.request).then(r => { const k = r.clone(); caches.open(C).then(c => c.put(e.request, k)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
    return;
  }
  if (u.pathname.endsWith("stops.json")) {
    e.respondWith(caches.open(C).then(c => c.match(e.request, {ignoreSearch: true}).then(alt => {
      const neu = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => alt);
      return alt || neu;
    })));
    return;
  }
  if (eigen || /cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host)) {
    e.respondWith(caches.match(e.request).then(alt => alt || fetch(e.request).then(r => { const k = r.clone(); caches.open(C).then(c => c.put(e.request, k)); return r; })));
  }
});