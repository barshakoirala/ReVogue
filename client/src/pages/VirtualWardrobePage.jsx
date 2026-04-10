import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import { CLASSES } from "../constants/theme";
import { useGetWardrobeQuery, useCreateWardrobeItemMutation, useDeleteWardrobeItemMutation, useLazyGetStyleSuggestionsQuery } from "../store/api/wardrobeApi";
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
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [styleParentId, setStyleParentId] = useState("");
  const [styleSubcatId, setStyleSubcatId] = useState("");
  const [hasRequestedSuggestions, setHasRequestedSuggestions] = useState(false);

  const [getStyleSuggestions, { data: suggestions = [], isLoading: suggestionsLoading, isSuccess: suggestionsSuccess, isError: suggestionsError }] =
    useLazyGetStyleSuggestionsQuery();

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

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.title?.toLowerCase().includes(q));
  }, [items, search]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setShowStyleModal(false);
    setStyleParentId("");
    setStyleSubcatId("");
    setHasRequestedSuggestions(false);
  };

  const handleStyleContinue = (e) => {
    e.preventDefault();
    if (!styleParentId || !styleSubcatId || selectedIds.length === 0) return;
    setHasRequestedSuggestions(true);
    getStyleSuggestions({ wardrobeItemIds: selectedIds, targetSubcategoryId: styleSubcatId });
  };

  const styleSelectedCount = selectedIds.length;

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900`}>
            Virtual Wardrobe
          </h1>
          <p className="mt-2 text-sm text-stone-600 max-w-xl">
            Add pieces you already own to your digital wardrobe. Each item is linked to a category so it can be used by the stylist later.
          </p>
        </header>

        <section className="mb-6 rounded-xl border border-stone-200 bg-white px-4 py-5 sm:px-6">
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

        <section className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search in your wardrobe…"
            className="w-full sm:w-72 px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-revogue-purple focus:border-revogue-purple"
          />
          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            <span className="text-xs text-stone-500">
              {styleSelectedCount > 0 ? `${styleSelectedCount} selected` : "No items selected"}
            </span>
            <button
              type="button"
              onClick={() => styleSelectedCount > 0 && setShowStyleModal(true)}
              disabled={styleSelectedCount === 0}
              className={`px-4 py-1.5 rounded-lg ${CLASSES.primaryButton} text-xs font-semibold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Style
            </button>
            {styleSelectedCount > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-stone-500 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        <section>
          {isLoading && <p className="text-sm text-stone-500">Loading your wardrobe…</p>}
          {error && (
            <p className="text-sm text-red-600">
              Unable to load wardrobe items. Please try again later.
            </p>
          )}
          {!isLoading && !error && filteredItems.length === 0 && (
            <p className="text-sm text-stone-500">
              You haven&apos;t added anything to your virtual wardrobe yet.
            </p>
          )}
          {!isLoading && !error && filteredItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const selected = selectedIds.includes(item._id);
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => toggleSelect(item._id)}
                    className={`text-left rounded-xl border px-3 py-3 bg-white transition-all ${
                      selected
                        ? "border-revogue-purple ring-2 ring-revogue-purple/40"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {item.images?.[0] && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 line-clamp-2">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {item.category?.name}
                          {item.subcategory?.name ? ` / ${item.subcategory.name}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full border text-[10px] ${
                          selected
                            ? "bg-revogue-purple border-revogue-purple text-white"
                            : "border-stone-300 text-stone-400"
                        }`}
                      >
                        {selected ? "✓" : ""}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item._id);
                        }}
                        className="text-[11px] text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {showStyleModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 pb-4 flex-shrink-0 border-b border-stone-100">
              <h2 className={`${CLASSES.heading} text-lg font-semibold text-stone-900`}>
                Style selected items
              </h2>
            </div>
            <div className="p-6 pt-4 overflow-y-auto flex-1 min-h-0">
            {!hasRequestedSuggestions ? (
              <>
                <p className="text-xs text-stone-500 mb-4">
                  You selected {styleSelectedCount} item{styleSelectedCount > 1 ? "s" : ""}. Choose
                  a category to find items from your wardrobe that go with them.
                </p>
                <form onSubmit={handleStyleContinue} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Category
                    </label>
                    <select
                      value={styleParentId}
                      onChange={(e) => {
                        setStyleParentId(e.target.value);
                        setStyleSubcatId("");
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-revogue-purple focus:border-revogue-purple"
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
                      value={styleSubcatId}
                      onChange={(e) => setStyleSubcatId(e.target.value)}
                      disabled={!styleParentId}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-revogue-purple focus:border-revogue-purple disabled:bg-stone-100 disabled:text-stone-400"
                    >
                      <option value="">Select</option>
                      {(categories.find((c) => c._id === styleParentId)?.subcategories ??
                        []
                      ).map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowStyleModal(false)}
                      className="px-4 py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-lg ${CLASSES.primaryButton} text-xs font-semibold uppercase tracking-wide`}
                      disabled={!styleParentId || !styleSubcatId}
                    >
                      Continue
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                {suggestionsLoading ? (
                  <div className="py-12 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-stone-200 border-t-revogue-purple animate-spin" />
                    <p className="text-sm text-stone-500">Finding items from your wardrobe…</p>
                  </div>
                ) : suggestionsError ? (
                  <>
                    <p className="text-sm text-red-600 py-4">Couldn&apos;t load suggestions. Please try again.</p>
                    <button
                      type="button"
                      onClick={() => setHasRequestedSuggestions(false)}
                      className="px-4 py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50"
                    >
                      Back
                    </button>
                  </>
                ) : suggestionsSuccess ? (
                  <>
                    {suggestions.length > 0 ? (
                      <p className="text-sm text-stone-600 mb-4">
                        From your wardrobe that go with your selection:
                      </p>
                    ) : (
                      <p className="text-sm text-stone-600 mb-4">
                        You don&apos;t have any items in this category that go with your selection.
                      </p>
                    )}
                    {suggestions.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 mb-4 max-h-64 overflow-y-auto">
                        {suggestions.map((item) => (
                          <div
                            key={item._id}
                            className="text-left rounded-md border border-stone-200 bg-stone-50 overflow-hidden flex flex-col"
                          >
                            <div className="w-full aspect-square bg-stone-200 relative overflow-hidden flex-shrink-0">
                              {item.images?.[0] ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">✦</div>
                              )}
                            </div>
                            <div className="p-1 min-w-0">
                              <p className="text-[10px] font-medium text-stone-900 truncate leading-tight" title={item.title}>
                                {item.title}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {suggestions.length === 0 && (
                      <Link
                        to="/browse"
                        className={`inline-flex justify-center w-full px-5 py-3.5 rounded-xl ${CLASSES.primaryButton} text-sm font-semibold shadow-sm hover:shadow transition-shadow`}
                        onClick={clearSelection}
                      >
                        Buy Items
                      </Link>
                    )}
                    <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setHasRequestedSuggestions(false)}
                        className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className={`px-5 py-2.5 rounded-xl ${CLASSES.primaryButton} text-sm font-semibold`}
                      >
                        Done
                      </button>
                    </div>
                  </>
                ) : null}
              </>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

