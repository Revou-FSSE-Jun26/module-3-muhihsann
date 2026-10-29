"use client";

import CategoryNameForm from "@/components/dashboard/CategoryNameForm";
import { updateCategory } from "@/lib/api";
import { notify } from "@/lib/toast";
import type { Category } from "@/lib/types";

interface EditCategoryFormProps {
  category: Category;
  onSaved: (category: Category) => void;
  onCancel: () => void;
}

/**
 * Renames a category via PUT /categories/[id], pre-populated with its current
 * name. Only the name is sent, so the backend keeps any existing description.
 * Used in a modal.
 */
export default function EditCategoryForm({
  category,
  onSaved,
  onCancel,
}: EditCategoryFormProps) {
  async function handleSubmit(name: string) {
    try {
      const saved = await updateCategory(category.id, { name });
      notify.success(`Category renamed to "${saved.name}".`);
      onSaved(saved);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Couldn't update the category.");
      throw err; // CategoryNameForm shows it inline too
    }
  }

  return (
    <CategoryNameForm
      initialName={category.name}
      submitLabel="Save changes"
      savingLabel="Saving…"
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
