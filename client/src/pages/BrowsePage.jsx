import { useSearchParams, Link } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import { CLASSES } from "../constants/theme";
import { useGetProductsPaginatedQuery } from "../store/api/productsApi";

const TABS = [
  { id: "all",    label: "All",    tier: null, section: null },
  { id: "luxury", label: "Luxury", tier: "luxury", section: null },
  { id: "normal", label: "Normal", tier: "normal", section: null },
];

const PAGE_SIZE = 12;

// Category-aware image fallback
const FALLBACK = {
  bags:      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
  jewelry:   "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
  watches:   "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80",
  sneakers:  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  boots:     "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80",
  formal:    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
  sandals:   "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
  dresses:   "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
  tops:      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80",
  bottoms:   "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
  outerwear: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80",
  scarves:   "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80",
};

function getImage(product) {
  if (product.images?.[0]) return product.images[0];
  const sub = (product.subcategory?.name || "").toLowerCase();
  if (sub === "bags") return FALLBACK.bags;
  if (sub === "jewelry") return FALLBACK.jewelry;
  if (sub === "sneakers") return FALLBACK.sneakers;
  if (sub === "boots") return FALLBACK.boots;
  if (sub === "formal") return FALLBACK.formal;
  if (sub === "sandals") return FALLBACK.sandals;
  if (sub === "dresses") return FALLBACK.dresses;
  if (sub === "tops") return FALLBACK.tops;
  if (sub === "bottoms") return FALLBACK.bottoms;
  if (sub === "outerwear") return FALLBACK.outerwear;
  if (sub === "scarves") return FALLBACK.scarves;
  return `https://picsum.photos/seed/${product._id}/400/500`;
}

function ProductCard({ product }) {
  const imageUrl = getImage(product);

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="w-full aspect-square bg-stone-50 overflow-hidden mb-3 relative">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {product.tier === "luxury" && (
          <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.2em] bg-white/90 text-stone-700 px-2 py-0.5">
            Luxury
          </span>
        )}
      </div>
      <div className="text-center space-y-0.5 px-1">
        {product.brand?.name && (
          <p className="text-[9px] uppercase tracking-[0.22em] text-stone-400">{product.brand.name}</p>
        )}
        <p className="text-[11px] uppercase tracking-[0.12em] text-stone-800 line-clamp-2 leading-relaxed">
          {product.title}
        </p>
        <p className="text-[11px] text-stone-500 tracking-wide">NPR {product.price?.toLocaleString()}</p>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-square bg-stone-100 mb-3" />
      <div className="space-y-1.5 px-2">
        <div className="h-2 bg-stone-100 rounded w-1/2 mx-auto" />
        <div className="h-2.5 bg-stone-100 rounded w-3/4 mx-auto" />
        <div className="h-2 bg-stone-100 rounded w-1/3 mx-auto" />
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
    tier: tab.tier,
    section: tab.section,
    page,
    limit: PAGE_SIZE,
  });

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  const setTab = (id) => setSearchParams({ tab: id });
  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
  };

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-white`}>
      <UserHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <h1 className={`${CLASSES.heading} text-xs uppercase tracking-[0.35em] text-stone-900`}>
            {tab.id === "all" && "All Products"}
            {tab.id === "luxury" && "Luxury Collection"}
            {tab.id === "normal" && "Everyday Collection"}
          </h1>
          {!isLoading && total > 0 && (
            <p className="text-[10px] text-stone-400 tracking-widest mt-1">{total} pieces</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-8 mb-10 border-b border-stone-100 pb-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 text-[11px] uppercase tracking-[0.22em] transition-colors border-b-[1.5px] -mb-px ${
                activeTab === t.id
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <p className="text-[11px] uppercase tracking-widest text-stone-400">Unable to load products</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[11px] uppercase tracking-widest text-stone-400">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 disabled:opacity-30 transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="px-2 text-stone-300 text-xs">·</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-[11px] tracking-wide transition-colors ${
                      page === p ? "bg-stone-900 text-white" : "text-stone-400 hover:text-stone-900"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="mt-12 text-center">
            <Link to="/browse" className="text-[10px] uppercase tracking-[0.3em] text-stone-500 border-b border-stone-300 pb-0.5 hover:text-stone-900 hover:border-stone-900 transition-colors">
              View All
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
