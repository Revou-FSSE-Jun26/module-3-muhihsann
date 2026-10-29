import { LIVE_API } from "./live-helpers";

/**
 * Wake the Render backend before the tests start. On the free tier the first
 * request after a quiet period can take ~30s; doing it once here keeps that
 * delay out of the individual tests.
 */
export default async function globalSetup() {
  const started = Date.now();
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const res = await fetch(`${LIVE_API}/products`, {
        signal: AbortSignal.timeout(60_000),
      });
      if (res.ok) {
        console.log(`[live] API awake after ${Math.round((Date.now() - started) / 1000)}s`);
        return;
      }
    } catch {
      // still waking up; try again
    }
    await new Promise((r) => setTimeout(r, 5_000));
  }
  throw new Error(`[live] API at ${LIVE_API} did not respond. Is it deployed?`);
}
