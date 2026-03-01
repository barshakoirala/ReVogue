import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import { CLASSES } from "../constants/theme";
import { useGetProductsPaginatedQuery, useGetGoesWithQuery } from "../store/api/productsApi";

const PAGE_SIZE = 24;

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

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState("");
  const q = searchParams.get("q") || "";

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const term = inputValue.trim();
    if (term) {
      setSearchParams({ q: term });
    } else {
      setSearchParams({});
    }
  };

  const { data: searchData, isLoading: searchLoading, error: searchError } = useGetProductsPaginatedQuery(
    { search: q || undefined, page: 1, limit: PAGE_SIZE },
    { skip: !q }
  );

  const products = searchData?.products ?? [];
  const productIds = products.slice(0, 8).map((p) => p._id);

  const { data: goesWithProducts = [], isLoading: goesWithLoading } = useGetGoesWithQuery(
    { productIds, limit: 8 },
    { skip: !q || productIds.length === 0 }
  );

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2 max-w-xl">
            <input
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search products..."
              className={`flex-1 px-4 py-3 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 ${CLASSES.inputFocus}`}
              aria-label="Search products"
            />
            <button
              type="submit"
              className={`px-6 py-3 rounded-lg ${CLASSES.primaryButton} text-sm font-medium whitespace-nowrap`}
            >
              Search
            </button>
          </div>
        </form>

        {!q && (
          <p className="text-stone-500">Enter a search term above to find products.</p>
        )}

        {q && searchLoading && (
          <p className="text-stone-500">Searching...</p>
        )}

        {q && searchError && (
          <p className="text-red-600">Could not load results. Try again.</p>
        )}

        {q && !searchLoading && !searchError && (
          <>
            <section className="mb-12">
              <h2 className={`${CLASSES.heading} text-lg font-semibold text-stone-900 mb-4`}>
                Search results {products.length > 0 ? `(${products.length})` : ""}
              </h2>
              {products.length === 0 ? (
                <p className="text-stone-500">No products found for &quot;{q}&quot;.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </section>

            {(products.length > 0 && goesWithProducts.length > 0) && (
              <section>
                <h2 className={`${CLASSES.heading} text-lg font-semibold text-stone-900 mb-4`}>
                  Items that might go with your search
                </h2>
                {goesWithLoading ? (
                  <p className="text-stone-500">Loading suggestions...</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {goesWithProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
