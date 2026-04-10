import { useState } from "react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../store/api/adminApi";

export default function AdminCategories() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", parent: "" });
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");

  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const reset = () => { setForm({ name: "", parent: "" }); setEditing(null); setShowForm(false); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) await updateCategory({ id: editing._id, name: form.name.trim() }).unwrap();
      else await createCategory({ name: form.name.trim(), parent: form.parent || null }).unwrap();
      reset();
    } catch (err) { setError(err?.data?.message || "Failed to save"); }
  };

  const handleDelete = async () => {
    try { await deleteCategory(deleteId).unwrap(); setDeleteId(null); }
    catch (err) { setError(err?.data?.message || "Failed to delete"); }
  };

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">{categories.length} parent categories</p>
        </div>
        {!showForm && (
          <button onClick={() => { reset(); setShowForm(true); }} className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">
            + Add Category
          </button>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{editing ? "Edit Category" : "New Category"}</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input className={inp} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            {!editing && (
              <div className="w-48">
                <label className="block text-xs font-medium text-gray-600 mb-1">Parent (optional)</label>
                <select className={inp} value={form.parent} onChange={(e) => setForm((p) => ({ ...p, parent: e.target.value }))}>
                  <option value="">None (top-level)</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <button type="submit" disabled={creating || updating} className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {creating || updating ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button type="button" onClick={reset} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="space-y-3">
          {categories.map((parent) => (
            <div key={parent._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{parent.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {parent.subcategories?.length ?? 0} sub
                  </span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setEditing(parent); setForm({ name: parent.name, parent: "" }); setShowForm(true); }} className="text-xs text-gray-500 hover:text-purple-700 font-medium">Edit</button>
                  <button onClick={() => setDeleteId(parent._id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                </div>
              </div>
              {(parent.subcategories || []).length > 0 && (
                <div className="divide-y divide-gray-50">
                  {parent.subcategories.map((sub) => (
                    <div key={sub._id} className="flex items-center justify-between px-5 py-2.5 pl-10 bg-gray-50/50">
                      <span className="text-sm text-gray-600">{sub.name}</span>
                      <div className="flex gap-3">
                        <button onClick={() => { setEditing(sub); setForm({ name: sub.name, parent: parent._id }); setShowForm(true); }} className="text-xs text-gray-500 hover:text-purple-700 font-medium">Edit</button>
                        <button onClick={() => setDeleteId(sub._id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">No categories yet.</div>}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete category?</h3>
            <p className="text-sm text-gray-500 mb-5">This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
