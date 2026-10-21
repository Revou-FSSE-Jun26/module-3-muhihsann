/* =====================================================================
   Thin wrapper around react-hot-toast so success/error notifications are
   styled consistently across the app. Import { notify } and call
   notify.success(...) / notify.error(...).
   ===================================================================== */

import toast from "react-hot-toast";

export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
};

export default notify;
