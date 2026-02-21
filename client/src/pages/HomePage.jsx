import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import { useGetProductsQuery } from "../store/api/productsApi";
import { logout } from "../store/slices/authSlice";
import { authApi } from "../store/api/authApi";

const TIER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "luxury", label: "Luxury" },
  { id: "normal", label: "Normal" },
];

const SECTIONS = [
  { id: "all", label: "All" },
  { id: "trending", label: "Trending" },
  { id: "new", label: "New" },
  { id: "others", label: "Others" },
];

function ProductCard({ product }) {
  const imageUrl = product.images?.[0] || "https://picsum.photos/400/400?random=1";
  const brandName = product.brand?.name;
  const tierLabel = product.tier === "luxury" ? "Luxury" : null;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-stone-100"
    >
      <div className="aspect-square bg-stone-100 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {tierLabel && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-900/90 text-amber-50 rounded">
            {tierLabel}
          </span>
        )}
      </div>
      <div className="p-3">
        {brandName && (
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-0.5">
            {brandName}
          </p>
        )}
        <h3 className="font-medium text-stone-900 line-clamp-2 group-hover:text-amber-800">
          {product.title}
        </h3>
        <p className="text-sm text-stone-600 mt-1">
          NPR {product.price?.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}

function ProductSection({ title, tier, section }) {
  const { data: products = [], isLoading, error } = useGetProductsQuery({
    tier: tier === "all" ? undefined : tier,
    section,
  });

  if (isLoading) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-stone-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">{title}</h2>
        <p className="text-stone-500 text-sm">Unable to load products.</p>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">{title}</h2>
        <p className="text-stone-500 text-sm">No products in this section.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-stone-900 mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [tierFilter, setTierFilter] = useState("all");
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(authApi.util.resetApiState());
    navigate("/login");
  };

  const isAuthenticated = !!token;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-semibold text-stone-900 tracking-tight"
          >
            ReVogue
          </Link>
          <div className="flex items-center gap-6">
            <div
              role="group"
              aria-label="Filter by tier"
              className="flex p-0.5 bg-stone-200/80 rounded-lg"
            >
              {TIER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTierFilter(opt.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    tierFilter === opt.id
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <nav className="flex gap-6 items-center">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-stone-600">{user?.fullName}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-stone-600 hover:text-stone-900"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-stone-600 hover:text-stone-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium text-amber-900 hover:text-amber-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
            Sustainable second-hand fashion
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Curated pre-loved pieces. Luxury and everyday.
          </p>
        </div>

        <div className="space-y-12">
          {SECTIONS.map((sec) => (
            <ProductSection
              key={sec.id}
              title={sec.label}
              tier={tierFilter}
              section={sec.id}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
