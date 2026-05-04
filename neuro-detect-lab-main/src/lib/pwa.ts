export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.href);

    navigator.serviceWorker
      .register(serviceWorkerUrl, {
        scope: import.meta.env.BASE_URL,
      })
      .catch((error) => {
        console.error("Service worker registration failed", error);
      });
  });
}
