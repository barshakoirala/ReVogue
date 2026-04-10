import { useSearchParams, Link } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import { CLASSES } from "../constants/theme";
import { useGetProductsPaginatedQuery } from "../store/api/productsApi";

const TABS = [
  { id: "all",     label: "All",     tier: undefined, section: undefined },
  { id: "luxury",  label: "Luxury",  tier: "luxury",  section: undefined },
  { id: "normal",  label: "Normal",  tier: "normal",  section: undefined },
];

const PAGE_SIZE = 12;

function ProductCard({ product }) {
  const imageUrl = product.images?.[0] || `https://picsum.photos/seed/${product._id}/400/400`;
  const isLuxury = product.tier === "luxury";

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-stone-300 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="aspect-square bg-stone-100 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isLuxury && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest bg-revogue-purple text-white rounded-full shadow">
            Luxury
          </span>
        )}
        {product.ecoScore != null && (
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 text-[10px] font-semibold bg-green-600 text-white rounded-full shadow">
            🌱 {(product.ecoScore * 100).toFixed(0)}%
          </span>
        )}
      </div>
      <div className="p-3.5 flex flex-col gap-0.5">
        {product.brand?.name && (
          <p className="text-[11px] text-stone-400 uppercase tracking-widest">{product.brand.name}</p>
        )}
        <h3 className={`text-sm font-medium text-stone-900 line-clamp-2 ${CLASSES.cardHover} leading-snug`}>
          {product.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-sm font-semibold text-stone-800">NPR {product.price?.toLocaleString()}</p>
          {product.condition && (
            <span className="text-[10px] text-stone-400 border border-stone-200 rounded px-1.5 py-0.5">
              {product.condition}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse">
      <div className="aspect-square bg-stone-200" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 bg-stone-200 rounded w-1/3" />
        <div className="h-4 bg-stone-200 rounded w-3/4" />
        <div className="h-3 bg-stone-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const tab = TABS.find((t) => t.id === activeTab) || TABS[0];

  const { data, isLoading, error } = useGetProductsPaginatedQuery({
    tier: tab.tier ?? null,
    section: tab.section ?? null,
    page,
    limit: PAGE_SIZE,
  });

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  const setTab = (id) => {
    setSearchParams({ tab: id });
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
  };

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`${CLASSES.heading} text-3xl font-semibold text-stone-900 mb-1`}>
            {tab.id === "all" && "All Products"}
            {tab.id === "luxury" && "Luxury Collection"}
            {tab.id === "normal" && "Everyday Finds"}
          </h1>
          {!isLoading && total > 0 && (
            <p className="text-sm text-stone-400">{total} item{total !== 1 ? "s" : ""}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-stone-200 pb-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all -mb-px ${
                activeTab === t.id
                  ? "border-revogue-purple text-revogue-purple bg-white"
                  : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
              }`}
            >
              {t.label}
              {t.id === "luxury" && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-revogue-purple/10 text-revogue-purple rounded-full font-semibold uppercase tracking-wide">
                  ✦
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Banner — only on All tab */}
        {activeTab === "all" && (
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-stone-100 to-stone-50 border border-stone-200 px-8 py-6">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">ReVogue</p>
            <h2 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900`}>Sustainable second-hand fashion</h2>
            <p className="text-sm text-stone-500 mt-1">Curated pieces from coveted brands. Luxury and everyday.</p>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-stone-500 mb-3">Unable to load products.</p>
            <Link to="/" className={`${CLASSES.accentLink} text-sm font-medium`}>Back to home</Link>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-3xl mb-3">🛍️</p>
            <p className="text-stone-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 text-sm border border-stone-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 transition-colors"
            >
              ← Prev
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-stone-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                        page === p
                          ? "bg-revogue-purple text-white"
                          : "border border-stone-300 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm border border-stone-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
