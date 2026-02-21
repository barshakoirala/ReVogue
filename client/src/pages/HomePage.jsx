import { useState, useRef, useEffect } from "react";
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

const CARD_WIDTH = 160;
const CARD_HEIGHT = 276;
const CARD_GAP = 16;
const SCROLL_AMOUNT = CARD_WIDTH + CARD_GAP;

function ProductCard({ product }) {
  const imageUrl = product.images?.[0] || "https://picsum.photos/400/400?random=1";
  const brandName = product.brand?.name;
  const tierLabel = product.tier === "luxury" ? "Luxury" : null;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-stone-100 flex flex-col"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      <div className="w-full h-40 bg-stone-100 relative overflow-hidden flex-shrink-0">
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
      <div className="flex flex-col flex-1 min-h-0 p-3">
        <p className="text-xs text-stone-500 uppercase tracking-wider mb-0.5 min-h-[1rem] line-clamp-1">
          {brandName || "\u00A0"}
        </p>
        <h3 className="font-medium text-stone-900 line-clamp-2 group-hover:text-amber-800 flex-1 min-h-0">
          {product.title}
        </h3>
        <p className="text-sm text-stone-600 mt-1 flex-shrink-0">
          NPR {product.price?.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}

function ScrollArrow({ direction, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Scroll ${direction}`}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-white hover:text-stone-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 transition-all ${direction === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "left" ? (
          <path d="M15 18l-6-6 6-6" />
        ) : (
          <path d="M9 18l6-6-6-6" />
        )}
      </svg>
    </button>
  );
}

function ProductSection({ title, tier, section, browseLink }) {
  const scrollRef = useRef(null);
  const { data: products = [], isLoading, error } = useGetProductsQuery({
    tier: tier === "all" ? undefined : tier,
    section,
    limit: 10,
  });

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT, behavior: "smooth" });
  };

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [products]);

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-stone-900 uppercase tracking-widest">{title}</h2>
        </div>
        <div className="flex gap-4 overflow-x-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[160px] h-[276px] bg-stone-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-stone-900 uppercase tracking-widest">{title}</h2>
        </div>
        <p className="text-stone-500 text-sm">Unable to load products.</p>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-stone-900 uppercase tracking-widest">{title}</h2>
        </div>
        <p className="text-stone-500 text-sm">No products in this section.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-stone-900 uppercase tracking-widest">{title}</h2>
        <Link
          to={browseLink}
          className="text-xs text-stone-500 uppercase tracking-wider hover:text-stone-900 transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-0 sm:px-0 snap-x snap-mandatory"
        >
          {products.map((product) => (
            <div key={product._id} className="snap-start flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <ScrollArrow
          direction="left"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
        />
        <ScrollArrow
          direction="right"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
        />
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

      <main>
        <section className="relative h-[480px] -mx-4 sm:mx-0 sm:rounded-xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80)",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="text-amber-200/90 text-xs uppercase tracking-[0.3em] mb-3">Pre-loved luxury, reimagined</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight max-w-2xl">
              Sustainable second-hand fashion
            </h1>
            <p className="text-stone-300 text-sm sm:text-base mt-4 max-w-md">
              Curated pieces from coveted brands. Luxury and everyday.
            </p>
            <Link
              to="/browse/all"
              className="mt-8 px-8 py-3 border border-white/60 text-white text-sm font-medium tracking-wider uppercase hover:bg-white/10 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/browse/all?tier=luxury"
            className="group relative h-64 sm:h-80 rounded-xl overflow-hidden bg-stone-200"
          >
            <img
              src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80"
              alt="Luxury"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-stone-900/40" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-amber-200/90 text-xs uppercase tracking-[0.2em] mb-1">Resale</p>
              <h2 className="text-2xl font-light text-white tracking-tight">Luxury</h2>
              <p className="text-stone-300 text-sm mt-1">Designer pieces at a fraction</p>
            </div>
          </Link>
          <Link
            to="/browse/all?tier=normal"
            className="group relative h-64 sm:h-80 rounded-xl overflow-hidden bg-stone-200"
          >
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80"
              alt="Everyday"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-stone-900/30" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-amber-200/90 text-xs uppercase tracking-[0.2em] mb-1">Curated</p>
              <h2 className="text-2xl font-light text-white tracking-tight">Everyday</h2>
              <p className="text-stone-300 text-sm mt-1">Quality staples, gently worn</p>
            </div>
          </Link>
        </section>

        <section className="max-w-6xl mx-auto px-4 mt-16 py-12 border-y border-stone-200">
          <p className="text-center text-stone-500 text-xs uppercase tracking-[0.25em]">
            Shop the edit
          </p>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          {SECTIONS.map((sec, idx) => (
            <div key={sec.id}>
              <ProductSection
                title={sec.label}
                tier={tierFilter}
                section={sec.id}
                browseLink={`/browse/${sec.id}${tierFilter !== "all" ? `?tier=${tierFilter}` : ""}`}
              />
              {idx === 1 && (
                <div className="mt-16">
                  <div
                    className="h-48 sm:h-64 rounded-xl overflow-hidden -mx-4 sm:mx-0 bg-stone-200 relative"
                    style={{
                      backgroundImage: "url(https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&q=80)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
                      <p className="text-white/90 text-xs sm:text-sm uppercase tracking-[0.3em]">
                        Fashion that lasts
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
