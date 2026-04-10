import { useState } from "react";
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from "../../store/api/adminApi";

export default function AdminBrands() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const { data: brands = [], isLoading } = useGetBrandsQuery();
  const [createBrand, { isLoading: creating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: updating }] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const reset = () => { setName(""); setEditing(null); setShowForm(false); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;
    try {
      if (editing) await updateBrand({ id: editing._id, name: name.trim() }).unwrap();
      else await createBrand({ name: name.trim() }).unwrap();
      reset();
    } catch (err) { setError(err?.data?.message || "Failed to save"); }
  };

  const handleDelete = async () => {
    try { await deleteBrand(deleteId).unwrap(); setDeleteId(null); }
    catch (err) { setError(err?.data?.message || "Failed to delete"); }
  };

  const filtered = brands.filter((b) => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500">{brands.length} brands</p>
        </div>
        {!showForm && (
          <button onClick={() => { reset(); setShowForm(true); }} className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">
            + Add Brand
          </button>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{editing ? "Edit Brand" : "New Brand"}</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand name *</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Gucci"
              />
            </div>
            <button type="submit" disabled={creating || updating} className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {creating || updating ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button type="button" onClick={reset} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:gap-px sm:bg-gray-100">
            {filtered.map((brand) => (
              <div key={brand._id} className="bg-white px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">{brand.name}</span>
                <div className="flex gap-3">
                  <button onClick={() => { setEditing(brand); setName(brand.name); setShowForm(true); }} className="text-xs text-gray-500 hover:text-purple-700 font-medium">Edit</button>
                  <button onClick={() => setDeleteId(brand._id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="p-8 text-center text-gray-400 text-sm">No brands found.</p>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete brand?</h3>
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
