"use client";

import CategoryNameForm from "@/components/dashboard/CategoryNameForm";
import { createCategory } from "@/lib/api";
import { notify } from "@/lib/toast";
import type { Category } from "@/lib/types";

interface CreateCategoryFormProps {
  onCreated: (category: Category) => void;
  onCancel: () => void;
}

/** Creates a category (name only) via POST /categories. Used in a modal. */
export default function CreateCategoryForm({
  onCreated,
  onCancel,
}: CreateCategoryFormProps) {
  async function handleSubmit(name: string) {
    try {
      const created = await createCategory({ name });
      notify.success(`Category "${created.name}" created.`);
      onCreated(created);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Couldn't create the category.");
      throw err; // CategoryNameForm shows it inline too
    }
  }

  return (
    <CategoryNameForm
      submitLabel="Create category"
      savingLabel="Creating…"
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
