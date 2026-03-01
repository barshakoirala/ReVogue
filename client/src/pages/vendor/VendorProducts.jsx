import { useState } from "react";
import {
  useGetMyProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../../store/api/vendorProductsApi";
import { useGetCategoriesQuery, useGetBrandsQuery } from "../../store/api/productsApi";

const PRODUCT_CONDITIONS = ["New", "Like New", "Good", "Fair"];
const PRODUCT_TIERS = [
  { value: "normal", label: "Normal" },
  { value: "luxury", label: "Luxury" },
];

const INITIAL_ECO = {
  carbonSavedKg: "",
  waterSavedLiters: "",
  wasteDivertedKg: "",
  energySavedKwh: "",
  landUseSavedSqm: "",
  equivalentItemsAvoided: "",
  microplasticsAvoidedG: "",
  recycledContentPercent: "",
  notes: "",
};

const INITIAL_FORM = {
  title: "",
  description: "",
  price: "",
  category: "",
  subcategory: "",
  condition: "",
  size: "",
  brand: "",
  tier: "normal",
  trending: false,
  images: [],
  ecoSustainability: { ...INITIAL_ECO },
};

function ProductForm({ product, categories = [], brands = [], onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(() => {
    if (product) {
      const eco = product.ecoSustainability || {};
      return {
        title: product.title || "",
        description: product.description || "",
        price: product.price ?? "",
        category: product.category?._id || "",
        subcategory: product.subcategory?._id || "",
        condition: product.condition || "",
        size: product.size || "",
        brand: product.brand?._id || "",
        tier: product.tier || "normal",
        trending: product.trending || false,
        images: product.images?.length ? product.images : [],
        ecoSustainability: {
          carbonSavedKg: eco.carbonSavedKg ?? "",
          waterSavedLiters: eco.waterSavedLiters ?? "",
          wasteDivertedKg: eco.wasteDivertedKg ?? "",
          energySavedKwh: eco.energySavedKwh ?? "",
          landUseSavedSqm: eco.landUseSavedSqm ?? "",
          equivalentItemsAvoided: eco.equivalentItemsAvoided ?? "",
          microplasticsAvoidedG: eco.microplasticsAvoidedG ?? "",
          recycledContentPercent: eco.recycledContentPercent ?? "",
          notes: eco.notes ?? "",
        },
      };
    }
    return { ...INITIAL_FORM };
  });

  const parentCat = categories.find((c) => c._id === form.category);
  const subcategories = parentCat?.subcategories || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("eco.")) {
      const field = name.slice(4);
      setForm((prev) => ({
        ...prev,
        ecoSustainability: {
          ...prev.ecoSustainability,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "category" && { subcategory: "" }),
    }));
  };

  const handleImageUrl = (e) => {
    const val = e.target.value.trim();
    setForm((prev) => ({
      ...prev,
      images: val ? val.split(/\s+/).filter(Boolean) : [],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const eco = form.ecoSustainability || {};
    const hasEco =
      Object.keys(INITIAL_ECO).some(
        (k) => k !== "notes" && eco[k] !== "" && eco[k] != null
      ) || (eco.notes && String(eco.notes).trim());
    const ecoPayload = hasEco
      ? {
          carbonSavedKg: eco.carbonSavedKg === "" ? undefined : parseFloat(eco.carbonSavedKg),
          waterSavedLiters: eco.waterSavedLiters === "" ? undefined : parseFloat(eco.waterSavedLiters),
          wasteDivertedKg: eco.wasteDivertedKg === "" ? undefined : parseFloat(eco.wasteDivertedKg),
          energySavedKwh: eco.energySavedKwh === "" ? undefined : parseFloat(eco.energySavedKwh),
          landUseSavedSqm: eco.landUseSavedSqm === "" ? undefined : parseFloat(eco.landUseSavedSqm),
          equivalentItemsAvoided: eco.equivalentItemsAvoided === "" ? undefined : parseFloat(eco.equivalentItemsAvoided),
          microplasticsAvoidedG: eco.microplasticsAvoidedG === "" ? undefined : parseFloat(eco.microplasticsAvoidedG),
          recycledContentPercent: eco.recycledContentPercent === "" ? undefined : parseFloat(eco.recycledContentPercent),
          notes: eco.notes?.trim() || undefined,
        }
      : undefined;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      category: form.category || undefined,
      subcategory: form.subcategory || undefined,
      condition: form.condition || undefined,
      size: form.size.trim() || undefined,
      brand: form.brand || undefined,
      tier: form.tier,
      trending: form.trending,
      images: form.images,
      ecoSustainability: ecoPayload,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{product ? "Edit Product" : "Add Product"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
          <select
            name="condition"
            value={form.condition}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select</option>
            {PRODUCT_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
          <select
            name="subcategory"
            value={form.subcategory}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select</option>
            {subcategories.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <select
            name="brand"
            value={form.brand}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">None</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
          <input
            type="text"
            name="size"
            value={form.size}
            onChange={handleChange}
            placeholder="e.g. M, 38, One Size"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
          <select
            name="tier"
            value={form.tier}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {PRODUCT_TIERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (one per line)</label>
          <textarea
            value={form.images.join("\n")}
            onChange={handleImageUrl}
            placeholder="https://example.com/image.jpg"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
          />
        </div>
        <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Eco / Sustainability impact</h4>
          <p className="text-xs text-gray-500 mb-3">
            Optional. Helps buyers see environmental impact (e.g. CO₂ saved, water saved).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">CO₂ saved (kg)</label>
              <input
                type="number"
                name="eco.carbonSavedKg"
                value={form.ecoSustainability?.carbonSavedKg ?? ""}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="e.g. 5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Water saved (L)</label>
              <input
                type="number"
                name="eco.waterSavedLiters"
                value={form.ecoSustainability?.waterSavedLiters ?? ""}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="e.g. 100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Waste diverted (kg)</label>
              <input
                type="number"
                name="eco.wasteDivertedKg"
                value={form.ecoSustainability?.wasteDivertedKg ?? ""}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="e.g. 0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Energy saved (kWh)</label>
              <input
                type="number"
                name="eco.energySavedKwh"
                value={form.ecoSustainability?.energySavedKwh ?? ""}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="e.g. 10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Land use saved (m²)</label>
              <input
                type="number"
                name="eco.landUseSavedSqm"
                value={form.ecoSustainability?.landUseSavedSqm ?? ""}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="e.g. 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">New items avoided</label>
              <input
                type="number"
                name="eco.equivalentItemsAvoided"
                value={form.ecoSustainability?.equivalentItemsAvoided ?? ""}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="e.g. 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Microplastics avoided (g)</label>
              <input
                type="number"
                name="eco.microplasticsAvoidedG"
                value={form.ecoSustainability?.microplasticsAvoidedG ?? ""}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="e.g. 0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Recycled content (%)</label>
              <input
                type="number"
                name="eco.recycledContentPercent"
                value={form.ecoSustainability?.recycledContentPercent ?? ""}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                placeholder="0–100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-600 mb-0.5">Notes (optional)</label>
            <input
              type="text"
              name="eco.notes"
              value={form.ecoSustainability?.notes ?? ""}
              onChange={handleChange}
              placeholder="e.g. Second-hand, extends garment life"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="trending"
            name="trending"
            checked={form.trending}
            onChange={handleChange}
            className="rounded border-gray-300"
          />
          <label htmlFor="trending" className="text-sm text-gray-700">
            Mark as trending
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : product ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function VendorProducts() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: products = [], isLoading } = useGetMyProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const isSubmitting = isCreating || isUpdating;

  const handleSubmit = async (payload) => {
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, ...payload }).unwrap();
        setEditingProduct(null);
      } else {
        await createProduct(payload).unwrap();
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">My Products</h1>
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Products</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            Add Product
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <ProductForm
            product={editingProduct}
            categories={categories}
            brands={brands}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No products yet. Add your first product to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eco</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || "https://picsum.photos/64/64"}
                        alt=""
                        className="w-12 h-12 rounded object-cover bg-gray-100"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.title}</p>
                        {product.brand?.name && (
                          <p className="text-xs text-gray-500">{product.brand.name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">NPR {product.price?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.condition}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        product.tier === "luxury" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {product.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.ecoSustainability &&
                    (product.ecoSustainability.carbonSavedKg != null ||
                      product.ecoSustainability.waterSavedLiters != null ||
                      product.ecoSustainability.wasteDivertedKg != null ||
                      product.ecoSustainability.energySavedKwh != null ||
                      product.ecoSustainability.landUseSavedSqm != null ||
                      product.ecoSustainability.equivalentItemsAvoided != null ||
                      product.ecoSustainability.microplasticsAvoidedG != null ||
                      product.ecoSustainability.recycledContentPercent != null ||
                      product.ecoSustainability.notes) ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800" title={
                        [
                          product.ecoSustainability.carbonSavedKg != null &&
                            `CO₂: ${product.ecoSustainability.carbonSavedKg} kg`,
                          product.ecoSustainability.waterSavedLiters != null &&
                            `Water: ${product.ecoSustainability.waterSavedLiters} L`,
                          product.ecoSustainability.wasteDivertedKg != null &&
                            `Waste: ${product.ecoSustainability.wasteDivertedKg} kg`,
                          product.ecoSustainability.energySavedKwh != null &&
                            `Energy: ${product.ecoSustainability.energySavedKwh} kWh`,
                          product.ecoSustainability.landUseSavedSqm != null &&
                            `Land: ${product.ecoSustainability.landUseSavedSqm} m²`,
                          product.ecoSustainability.equivalentItemsAvoided != null &&
                            `Items avoided: ${product.ecoSustainability.equivalentItemsAvoided}`,
                          product.ecoSustainability.microplasticsAvoidedG != null &&
                            `Microplastics: ${product.ecoSustainability.microplasticsAvoidedG} g`,
                          product.ecoSustainability.recycledContentPercent != null &&
                            `Recycled: ${product.ecoSustainability.recycledContentPercent}%`,
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      }>
                        Eco
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.status}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product._id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-700 mb-4">Are you sure you want to delete this product?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
