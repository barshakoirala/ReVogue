import { useState } from "react";
import UserHeader from "../components/UserHeader";
import { CLASSES } from "../constants/theme";
import { useGetWardrobeQuery, useCreateWardrobeItemMutation, useDeleteWardrobeItemMutation } from "../store/api/wardrobeApi";
import { useGetCategoriesQuery } from "../store/api/productsApi";

export default function VirtualWardrobePage() {
  const { data: items = [], isLoading, error } = useGetWardrobeQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createItem, { isLoading: creating }] = useCreateWardrobeItemMutation();
  const [deleteItem] = useDeleteWardrobeItemMutation();

  const [title, setTitle] = useState("");
  const [parentId, setParentId] = useState("");
  const [subcatId, setSubcatId] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !parentId || !subcatId) return;
    try {
      await createItem({
        title: title.trim(),
        category: parentId,
        subcategory: subcatId,
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
      }).unwrap();
      setTitle("");
      setSubcatId("");
      setImageUrl("");
    } catch {
      // handled by UI via error state in future
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id).unwrap();
    } catch {
      // ignore for now
    }
  };

  const selectedParent = categories.find((c) => c._id === parentId);
  const subcategories = selectedParent?.subcategories ?? [];

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900`}>
              Virtual Wardrobe
            </h1>
            <p className="mt-2 text-sm text-stone-600 max-w-xl">
              Add pieces you already own to your digital wardrobe. Each item is linked to a category so it can be used by the stylist later.
            </p>
          </div>
        </header>

        <section className="mb-10 rounded-xl border border-stone-200 bg-white px-4 py-5 sm:px-6">
          <h2 className={`${CLASSES.heading} text-sm font-semibold text-stone-900 mb-4`}>
            Add an item
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Black denim jacket"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-revogue-purple focus:border-revogue-purple"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Category
                </label>
                <select
                  value={parentId}
                  onChange={(e) => {
                    setParentId(e.target.value);
                    setSubcatId("");
                  }}
                  className="w-full sm:w-40 px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-revogue-purple focus:border-revogue-purple"
                >
                  <option value="">Select</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Subcategory
                </label>
                <select
                  value={subcatId}
                  onChange={(e) => setSubcatId(e.target.value)}
                  className="w-full sm:w-44 px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-revogue-purple focus:border-revogue-purple"
                  disabled={!parentId}
                >
                  <option value="">Select</option>
                  {subcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-revogue-purple focus:border-revogue-purple"
                />
              </div>
              <button
                type="submit"
                disabled={creating || !title.trim() || !parentId || !subcatId}
                className={`mt-1 sm:mt-0 px-5 py-2.5 rounded-lg ${CLASSES.primaryButton} text-xs font-semibold uppercase tracking-wide disabled:opacity-60`}
              >
                {creating ? "Adding…" : "Add item"}
              </button>
            </div>
          </form>
        </section>

        <section>
          {isLoading && <p className="text-sm text-stone-500">Loading your wardrobe…</p>}
          {error && (
            <p className="text-sm text-red-600">
              Unable to load wardrobe items. Please try again later.
            </p>
          )}
          {!isLoading && !error && items.length === 0 && (
            <p className="text-sm text-stone-500">
              You haven&apos;t added anything to your virtual wardrobe yet.
            </p>
          )}
          {!isLoading && !error && items.length > 0 && (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {item.images?.[0] && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-stone-900">{item.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {item.category?.name}
                        {item.subcategory?.name ? ` / ${item.subcategory.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

