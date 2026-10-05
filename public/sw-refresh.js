self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const awaiting = new Map(windows.map((client) => [client.id, client]));
      const acknowledge = (message) => {
        if (message.data === "recall-update-handled")
          awaiting.delete(message.source.id);
      };
      self.addEventListener("message", acknowledge);
      for (const client of windows) client.postMessage("recall-update-ready");
      await new Promise((resolve) => setTimeout(resolve, 750));
      self.removeEventListener("message", acknowledge);
      const refresh = () => {
        for (const client of awaiting.values()) {
          const url = new URL(client.url);
          url.searchParams.set("recall-update", String(Date.now()));
          void client.navigate(url.href).catch((error) => {
            console.warn(
              "Recall update: an older window closed before refresh",
              error,
            );
          });
        }
      };
      const worker = self.registration.active;
      if (worker.state === "activated") refresh();
      else {
        // Fetching while activation is open can still return the old cached page.
        worker.addEventListener("statechange", () => {
          if (worker.state === "activated") refresh();
        });
      }
    })(),
  );
});
