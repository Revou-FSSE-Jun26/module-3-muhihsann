"use client";

import { useState } from "react";

interface InlineConfirmDeleteProps {
  /** Shown in the prompt and screen-reader labels, e.g. the product name. */
  itemName: string;
  /** Performs the delete. Errors should be handled (shown) by the caller. */
  onConfirm: () => Promise<void>;
  /** Base test id; the confirm button gets `${testId}-confirm`. */
  testId?: string;
}

/**
 * A row-level Delete button that asks for confirmation inline, right where
 * the user clicked, instead of opening a browser popup:
 *
 *   [Delete]  ->  Delete "Laptop"?  [Cancel] [Yes, delete]
 *
 * Focus moves to Cancel when the prompt opens, so pressing Enter by accident
 * never deletes anything.
 */
export default function InlineConfirmDelete({
  itemName,
  onConfirm,
  testId,
}: InlineConfirmDeleteProps) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        data-testid={testId}
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${itemName}`}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50"
      >
        Delete
      </button>
    );
  }

  return (
    <span
      role="group"
      aria-label={`Confirm deleting ${itemName}`}
      className="inline-flex items-center gap-2"
    >
      <span className="text-xs font-medium text-stone-600">
        Delete &ldquo;{itemName}&rdquo;?
      </span>
      <button
        type="button"
        autoFocus
        disabled={busy}
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-stone-400 disabled:opacity-60"
      >
        Cancel
      </button>
      <button
        type="button"
        data-testid={testId ? `${testId}-confirm` : undefined}
        disabled={busy}
        onClick={handleConfirm}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        {busy ? "Deleting…" : "Yes, delete"}
      </button>
    </span>
  );
}
