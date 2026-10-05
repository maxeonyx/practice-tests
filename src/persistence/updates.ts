import { registerSW } from "virtual:pwa-register";

export function automaticUpdates(ready: () => boolean) {
  const url = new URL(location.href);
  if (url.searchParams.has("recall-update")) {
    url.searchParams.delete("recall-update");
    history.replaceState(null, "", url.href);
  }
  let reloadPending = false;
  let reloading = false;
  const installedWorker = navigator.serviceWorker?.controller;
  let registration: ServiceWorkerRegistration | undefined;
  function apply() {
    if (reloadPending && !reloading && ready() && !document.hidden) {
      reloadPending = false;
      reloading = true;
      location.reload();
    }
  }
  function requestReload() {
    reloadPending = true;
    apply();
  }
  navigator.serviceWorker?.addEventListener("message", (event) => {
    if (event.data !== "recall-update-ready") return;
    event.source?.postMessage("recall-update-handled");
    if (installedWorker === undefined || installedWorker === null) return;
    const worker = event.source;
    if (!(worker instanceof ServiceWorker)) return;
    if (worker.state === "activated") requestReload();
    else
      worker.addEventListener("statechange", () => {
        if (worker.state === "activated") requestReload();
      });
  });
  async function check() {
    apply();
    if (registration === undefined || !navigator.onLine) return;
    try {
      await registration.update();
    } catch (error) {
      console.warn(
        "Recall update check failed; offline study remains available",
        error,
      );
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) void check();
  });
  window.addEventListener("online", () => {
    void check();
  });
  registerSW({
    immediate: true,
    onNeedReload: requestReload,
    onRegisteredSW(_url, value) {
      registration = value;
      void check();
    },
    onRegisterError(error) {
      console.error("Could not prepare offline revision", error);
    },
  });
  return apply;
}
