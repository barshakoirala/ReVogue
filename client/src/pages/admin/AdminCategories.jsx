import { useState } from "react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../store/api/adminApi";

export default function AdminCategories() {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", parent: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");

  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const resetForm = () => {
    setFormData({ name: "", parent: "" });
    setEditingCategory(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const name = formData.name.trim();
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory._id, name }).unwrap();
      } else {
        await createCategory({ name, parent: formData.parent || null }).unwrap();
      }
      resetForm();
    } catch (err) {
      setError(err?.data?.message || "Failed to save");
    }
  };

  const handleEdit = (cat, isSub) => {
    setEditingCategory(cat);
    const parentId = isSub && cat.parent ? (cat.parent._id || cat.parent) : "";
    setFormData({
      name: cat.name,
      parent: parentId,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err?.data?.message || "Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Categories</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            Add Category
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingCategory ? "Edit Category" : "Add Category"}</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            {!editingCategory && (
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent (optional)</label>
                <select
                  value={formData.parent}
                  onChange={(e) => setFormData((p) => ({ ...p, parent: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">None (top-level)</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isCreating || isUpdating ? "Saving..." : editingCategory ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.flatMap((parent) => [
              <tr key={parent._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{parent.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">Parent</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(parent, false)} className="text-sm text-gray-600 hover:text-gray-900 mr-3">Edit</button>
                  <button onClick={() => setDeleteConfirm(parent._id)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>,
              ...(parent.subcategories || []).map((sub) => (
                <tr key={sub._id} className="hover:bg-gray-50 bg-gray-50/50">
                  <td className="px-4 py-2 pl-8 text-gray-700">{sub.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">Subcategory</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleEdit(sub, true)} className="text-sm text-gray-600 hover:text-gray-900 mr-3">Edit</button>
                    <button onClick={() => setDeleteConfirm(sub._id)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              )),
            ])}
          </tbody>
        </table>
        {categories.length === 0 && <p className="p-6 text-center text-gray-500">No categories yet.</p>}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-gray-700 mb-4">Are you sure you want to delete this category?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
