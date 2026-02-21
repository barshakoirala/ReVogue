import { useParams, useSearchParams, Link } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import { CLASSES } from "../constants/theme";
import { useGetProductsPaginatedQuery } from "../store/api/productsApi";

const SECTION_LABELS = {
  all: "All Products",
  trending: "Trending",
  new: "New Arrivals",
  others: "Others",
};

const TIER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "luxury", label: "Luxury" },
  { id: "normal", label: "Normal" },
];

const PAGE_SIZE = 12;

function ProductCard({ product }) {
  const imageUrl = product.images?.[0] || "https://picsum.photos/400/400?random=1";
  const brandName = product.brand?.name;
  const tierLabel = product.tier === "luxury" ? "Luxury" : null;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-stone-100 flex flex-col"
    >
      <div className="aspect-square bg-stone-100 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {tierLabel && (
          <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${CLASSES.luxuryBadge} rounded`}>
            {tierLabel}
          </span>
        )}
      </div>
      <div className="p-3">
        {brandName && (
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-0.5">{brandName}</p>
        )}
        <h3 className={`font-medium text-stone-900 line-clamp-2 ${CLASSES.cardHover}`}>{product.title}</h3>
        <p className="text-sm text-stone-600 mt-1">NPR {product.price?.toLocaleString()}</p>
      </div>
    </Link>
  );
}

export default function BrowsePage() {
  const { section = "all" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const tier = searchParams.get("tier") || undefined;

  const { data, isLoading, error } = useGetProductsPaginatedQuery({
    section: section === "all" ? undefined : section,
    tier: tier === "all" ? undefined : tier,
    page,
    limit: PAGE_SIZE,
  });

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;
  const label = SECTION_LABELS[section] ?? "Products";

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
  };

  const setTier = (t) => {
    const next = new URLSearchParams(searchParams);
    if (t === "all") next.delete("tier");
    else next.set("tier", t);
    next.delete("page");
    setSearchParams(next);
  };

  if (isLoading) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-stone-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-stone-500">Unable to load products.</p>
          <Link to="/" className={`${CLASSES.accentLink} font-medium mt-2 inline-block`}>Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader showBack />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(SECTION_LABELS).map(([id, lbl]) => (
            <Link
              key={id}
              to={`/browse/${id}${tier ? `?tier=${tier}` : ""}`}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                section === id ? CLASSES.sectionActive : CLASSES.sectionInactive
              }`}
            >
              {lbl}
            </Link>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900`}>{label}</h1>
          <div className="flex p-0.5 bg-stone-200/80 rounded-lg w-fit">
            {TIER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTier(opt.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  (tier || "all") === opt.id ? CLASSES.tierActive : CLASSES.tierInactive
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <p className="text-stone-500 py-12">No products in this section.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 border border-stone-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100"
                >
                  Previous
                </button>
                <span className="text-sm text-stone-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 border border-stone-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
