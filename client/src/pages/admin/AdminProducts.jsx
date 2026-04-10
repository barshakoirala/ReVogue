import { useState } from "react";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetBrandsQuery,
} from "../../store/api/adminApi";

const CONDITIONS = ["New", "Like New", "Good", "Fair"];
const TIERS = ["normal", "luxury"];

const EMPTY_FORM = {
  title: "", description: "", price: "", condition: "", size: "",
  category: "", subcategory: "", brand: "", tier: "normal",
  trending: false, images: "",
};

function ProductForm({ initial, categories, brands, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(() => initial ? {
    ...initial,
    price: initial.price ?? "",
    category: initial.category?._id || "",
    subcategory: initial.subcategory?._id || "",
    brand: initial.brand?._id || "",
    images: (initial.images || []).join("\n"),
  } : EMPTY_FORM);

  const parentCat = categories.find((c) => c._id === form.category);
  const subs = parentCat?.subcategories || [];

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v, ...(k === "category" ? { subcategory: "" } : {}) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      condition: form.condition,
      size: form.size.trim() || undefined,
      category: form.category || undefined,
      subcategory: form.subcategory || undefined,
      brand: form.brand || undefined,
      tier: form.tier,
      trending: form.trending,
      images: form.images.split(/\n|\s+/).map((u) => u.trim()).filter(Boolean),
    });
  };

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-5">{initial ? "Edit Product" : "New Product"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
          <input className={inp} value={form.title} onChange={(e) => set("title", e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea className={inp} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Price (NPR) *</label>
          <input className={inp} type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Condition *</label>
          <select className={inp} value={form.condition} onChange={(e) => set("condition", e.target.value)} required>
            <option value="">Select</option>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
          <select className={inp} value={form.category} onChange={(e) => set("category", e.target.value)} required>
            <option value="">Select</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Subcategory</label>
          <select className={inp} value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)}>
            <option value="">None</option>
            {subs.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
          <select className={inp} value={form.brand} onChange={(e) => set("brand", e.target.value)}>
            <option value="">None</option>
            {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
          <input className={inp} value={form.size} onChange={(e) => set("size", e.target.value)} placeholder="e.g. M, 38" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tier</label>
          <select className={inp} value={form.tier} onChange={(e) => set("tier", e.target.value)}>
            {TIERS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" id="trending" checked={form.trending} onChange={(e) => set("trending", e.target.checked)} className="rounded border-gray-300 text-purple-600" />
          <label htmlFor="trending" className="text-sm text-gray-700">Mark as trending</label>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Image URLs (one per line)</label>
          <textarea className={`${inp} font-mono`} rows={2} value={form.images} onChange={(e) => set("images", e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50">
          {saving ? "Saving..." : initial ? "Update" : "Create"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
      </div>
    </form>
  );
}

export default function AdminProducts() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  const { data: products = [], isLoading } = useGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const filtered = products.filter((p) =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.brand?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (payload) => {
    try {
      if (editing) await updateProduct({ id: editing._id, ...payload }).unwrap();
      else await createProduct(payload).unwrap();
      setShowForm(false);
      setEditing(null);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    try { await deleteProduct(deleteId).unwrap(); setDeleteId(null); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{products.length} total</p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">
            + New Product
          </button>
        )}
      </div>

      {showForm && (
        <ProductForm
          initial={editing}
          categories={categories}
          brands={brands}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          saving={creating || updating}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || "https://picsum.photos/40/40"} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.title}</p>
                        <p className="text-xs text-gray-400">{p.brand?.name || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">NPR {p.price?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.tier === "luxury" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(p); setShowForm(true); }} className="text-xs text-gray-500 hover:text-purple-700 font-medium mr-3">Edit</button>
                    <button onClick={() => setDeleteId(p._id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="p-8 text-center text-gray-400 text-sm">No products found.</p>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete product?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
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
