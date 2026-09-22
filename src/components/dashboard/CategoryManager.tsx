"use client";

import React, { useState } from "react";
import { Category } from "@/types";
import { api } from "@/lib/api";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { useUIStore } from "@/store/useUIStore";
import { getImageUrl } from "@/lib/utils";
import { FolderPlus, Trash2, Edit3, Image as ImageIcon } from "lucide-react";

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onRefresh }) => {
  const { addToast } = useUIStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (description) formData.append("description", description);
      if (imageFile) formData.append("image", imageFile);

      await api.post("/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      addToast({
        type: "success",
        title: "Category Created",
        message: `Category "${name}" added successfully.`,
      });

      setModalOpen(false);
      setName("");
      setDescription("");
      setImageFile(null);
      onRefresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Creation Error",
        message: err.response?.data?.message || "Failed to create category",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/categories/${catId}`);
      addToast({
        type: "success",
        title: "Category Deleted",
        message: "Category removed successfully.",
      });
      onRefresh();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Delete Error",
        message: err.response?.data?.message || "Failed to delete category",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Course Categories</h3>
          <p className="text-xs text-slate-400">Manage learning domains, tags, and category imagery.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<FolderPlus className="w-4 h-4" />}
          onClick={() => setModalOpen(true)}
        >
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  {cat.image ? (
                    <img
                      src={getImageUrl(cat.image)}
                      alt={cat.name}
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{cat.description || "No description"}</p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteCategory(cat._id)}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Category"
        description="Organize courses into high-level subjects."
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="Computer Science"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of topics covered in this domain..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Category Banner Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/20 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
