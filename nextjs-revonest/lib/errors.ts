/* =====================================================================
   Turn anything thrown by an API call into a message a person can read.
   Backend error messages (e.g. "Cannot delete product with active orders")
   are shown as-is, so the user sees exactly why something failed.
   ===================================================================== */

import { ApiError } from "@/lib/api";

export function apiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  // fetch() rejects with a TypeError when the server can't be reached at all
  // (offline, CORS, or the free-tier API still waking up).
  if (err instanceof TypeError) {
    return "Couldn't reach the server. Please try again in a moment.";
  }
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}
