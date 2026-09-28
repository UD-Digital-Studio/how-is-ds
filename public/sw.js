// Installability only: Chrome will not offer an install prompt unless a service
// worker with a fetch handler is registered. It deliberately caches nothing —
// every page here is session-gated, and a cached response would outlive the
// session it was fetched under and could surface one user's projects to the
// next person on a shared phone. The empty fetch handler leaves every request
// to the network, which is exactly the behaviour we want.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
