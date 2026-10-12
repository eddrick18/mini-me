// Download hints only: rendered Image onLoad events remain the decode/readiness authority.
export function createAssetWarmup(
  fetch: (uri: string) => Promise<unknown>,
  concurrency = 2,
  timeoutMs = 10000,
) {
  const pending = new Map<string, Promise<void>>(),
    cached = new Set<string>();
  const queue: { uri: string; resolve: () => void }[] = [];
  let active = 0;
  function pump() {
    while (active < concurrency && queue.length) {
      const job = queue.shift()!;
      active++;
      let timer: ReturnType<typeof setTimeout>;
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Asset warmup timed out")),
          timeoutMs,
        );
      });
      Promise.race([Promise.resolve().then(() => fetch(job.uri)), timeout])
        .then((result) => {
          if (result !== false) cached.add(job.uri);
        })
        .catch(() => {
          /* On-screen loading/retry owns user feedback. */
        })
        .finally(() => {
          clearTimeout(timer);
          active--;
          pending.delete(job.uri);
          job.resolve();
          pump();
        });
    }
  }
  return {
    warm(uris: readonly string[]) {
      return Promise.all(
        uris.map((uri) => {
          if (cached.has(uri)) return Promise.resolve();
          const existing = pending.get(uri);
          if (existing) return existing;
          const promise = new Promise<void>((resolve) =>
            queue.push({ uri, resolve }),
          );
          pending.set(uri, promise);
          pump();
          return promise;
        }),
      );
    },
  };
}
