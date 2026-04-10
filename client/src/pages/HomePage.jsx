import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetProductsQuery } from "../store/api/productsApi";
import UserHeader from "../components/UserHeader";
import { CLASSES } from "../constants/theme";

const TIER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "luxury", label: "Luxury" },
  { id: "normal", label: "Normal" },
];

const SECTIONS = [
  { id: "trending", label: "Trending Now" },
  { id: "new", label: "New Arrivals" },
  { id: "others", label: "The Edit" },
];

const SCROLL_AMOUNT = 176;

function ProductCard({ product }) {
  const imageUrl = product.images?.[0] || `https://picsum.photos/seed/${product._id}/400/500`;
  const brandName = product.brand?.name;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex-shrink-0 block"
      style={{ width: 160 }}
    >
      <div className="w-full aspect-[3/4] bg-stone-100 overflow-hidden mb-3 relative">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {product.tier === "luxury" && (
          <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.2em] bg-white/90 text-stone-800 px-2 py-0.5">
            Luxury
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        {brandName && (
          <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400">{brandName}</p>
        )}
        <p className="text-xs text-stone-800 line-clamp-1 tracking-wide">{product.title}</p>
        <p className="text-xs text-stone-500">NPR {product.price?.toLocaleString()}</p>
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
      className={`absolute top-[40%] z-10 w-8 h-8 bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-20 transition-all ${
        direction === "left" ? "-left-4" : "-right-4"
      }`}
    >
      {direction === "left" ? "←" : "→"}
    </button>
  );
}

function ProductSection({ title, tier, section, browseLink }) {
  const scrollRef = useRef(null);
  const { data: products = [], isLoading } = useGetProductsQuery({
    tier: tier === "all" ? undefined : tier,
    section,
    limit: 10,
  });

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

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT, behavior: "smooth" });
  };

  return (
    <section>
      <div className="flex items-baseline justify-between mb-6 border-b border-stone-100 pb-3">
        <h2 className={`${CLASSES.heading} text-xs uppercase tracking-[0.25em] text-stone-900`}>{title}</h2>
        <Link to={browseLink} className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700 transition-colors">
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 h-64 bg-stone-100 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-xs text-stone-400 tracking-wide py-8">No products available.</p>
      ) : (
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          >
            {products.map((p) => (
              <div key={p._id} className="snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <ScrollArrow direction="left" onClick={() => scroll("left")} disabled={!canScrollLeft} />
          <ScrollArrow direction="right" onClick={() => scroll("right")} disabled={!canScrollRight} />
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [tierFilter, setTierFilter] = useState("all");

  const tierFilterEl = (
    <div className="flex gap-6">
      {TIER_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setTierFilter(opt.id)}
          className={`text-[11px] uppercase tracking-[0.2em] transition-colors pb-0.5 ${
            tierFilter === opt.id
              ? "text-stone-900 border-b border-stone-900"
              : "text-stone-400 hover:text-stone-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-white`}>
      <UserHeader centerContent={tierFilterEl} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Hero — full-width editorial image */}
        {tierFilter === "all" && (
          <>
            <section className="mt-6 mb-16">
              <div className="relative w-full h-[70vh] min-h-[480px] overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=90"
                  alt="ReVogue"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/70 mb-4">Pre-loved luxury, reimagined</p>
                  <h1 className={`${CLASSES.heading} text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-[0.08em] max-w-3xl leading-tight`}>
                    Sustainable<br />Second-Hand Fashion
                  </h1>
                  <Link
                    to="/browse"
                    className="mt-10 px-10 py-3 border border-white/70 text-white text-[11px] uppercase tracking-[0.3em] hover:bg-white hover:text-stone-900 transition-all duration-300"
                  >
                    Discover
                  </Link>
                </div>
              </div>
            </section>

            {/* Two editorial banners */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-20">
              <Link to="/browse?tab=luxury" className="group relative overflow-hidden bg-stone-100 aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=85"
                  alt="Luxury"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute bottom-0 left-0 p-8">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/60 mb-2">Collection</p>
                  <h2 className={`${CLASSES.heading} text-2xl font-light text-white tracking-[0.1em] uppercase`}>Luxury</h2>
                  <p className="text-[11px] text-white/70 mt-1 tracking-wide">Designer pieces, pre-loved</p>
                </div>
              </Link>
              <Link to="/browse?tab=normal" className="group relative overflow-hidden bg-stone-100 aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=85"
                  alt="Everyday"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-0 left-0 p-8">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/60 mb-2">Curated</p>
                  <h2 className={`${CLASSES.heading} text-2xl font-light text-white tracking-[0.1em] uppercase`}>Everyday</h2>
                  <p className="text-[11px] text-white/70 mt-1 tracking-wide">Quality staples, gently worn</p>
                </div>
              </Link>
            </section>

            {/* Divider */}
            <div className="flex items-center gap-6 mb-16">
              <div className="flex-1 h-px bg-stone-100" />
              <p className={`${CLASSES.heading} text-[10px] uppercase tracking-[0.35em] text-stone-400`}>The Edit</p>
              <div className="flex-1 h-px bg-stone-100" />
            </div>
          </>
        )}

        {/* Product sections */}
        <div className="space-y-16 pb-20">
          {SECTIONS.map((sec, idx) => (
            <div key={sec.id}>
              <ProductSection
                title={sec.label}
                tier={tierFilter}
                section={sec.id}
                browseLink="/browse?tab=all"
              />
              {/* Mid-page editorial strip */}
              {idx === 1 && tierFilter === "all" && (
                <div className="mt-16 relative h-40 overflow-hidden bg-stone-900">
                  <img
                    src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1400&q=80"
                    alt=""
                    className="w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className={`${CLASSES.heading} text-[11px] uppercase tracking-[0.5em] text-white/80`}>
                      Fashion That Lasts
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer strip */}
        <div className="border-t border-stone-100 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className={`${CLASSES.heading} text-xs uppercase tracking-[0.3em] text-stone-900 mb-1`}>ReVogue</p>
            <p className="text-[11px] text-stone-400 tracking-wide">Sustainable second-hand fashion</p>
          </div>
          <div className="flex gap-8">
            <Link to="/browse" className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700 transition-colors">Shop</Link>
            <Link to="/donations" className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700 transition-colors">Donate</Link>
            <Link to="/eco" className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700 transition-colors">Eco Impact</Link>
            <Link to="/contact" className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700 transition-colors">Contact</Link>
          </div>
        </div>

      </main>
    </div>
  );
}
