import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CLASSES } from "../constants/theme";
import { useSelector } from "react-redux";
import { useGetProductQuery } from "../store/api/productsApi";
import { useGetMeQuery } from "../store/api/authApi";
import { useAddToCartMutation } from "../store/api/cartApi";
import UserHeader from "../components/UserHeader";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data: product, isLoading, error } = useGetProductQuery(id);
  const [addToCart, { isLoading: adding, error: addError }] = useAddToCartMutation();

  const isUser = !!token && user?.role === "user";

  if (isLoading) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-white`}>
        <UserHeader />
        <div className="max-w-6xl mx-auto px-6 py-20 flex items-center justify-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-white`}>
        <UserHeader />
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-6">Product not found</p>
          <Link to="/browse" className="text-[10px] uppercase tracking-[0.25em] text-stone-500 border-b border-stone-300 pb-0.5 hover:text-stone-900">
            Return to shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [`https://picsum.photos/seed/${product._id}/600/700`];
  const addErrorMessage = addError?.data?.message || addError?.message || (addError && "Failed to add to cart");

  const handleAddToCart = async () => {
    try {
      await addToCart({ productId: id, quantity }).unwrap();
    } catch {}
  };

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-white`}>
      <UserHeader />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-stone-400">
          <Link to="/" className="hover:text-stone-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/browse" className="hover:text-stone-700 transition-colors">Shop</Link>
          {product.category?.name && (
            <>
              <span>/</span>
              <span>{product.category.name}</span>
            </>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Images */}
          <div className="space-y-3">
            <div className="w-full aspect-[4/5] bg-stone-50 overflow-hidden">
              <img
                src={images[activeImg]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 bg-stone-50 overflow-hidden border transition-colors ${
                      activeImg === i ? "border-stone-900" : "border-transparent hover:border-stone-300"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {/* Brand */}
            {product.brand?.name && (
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-3">
                {product.brand.name}
              </p>
            )}

            {/* Title */}
            <h1 className={`${CLASSES.heading} text-xl uppercase tracking-[0.12em] text-stone-900 mb-4 leading-relaxed`}>
              {product.title}
            </h1>

            {/* Price */}
            <p className="text-sm tracking-[0.1em] text-stone-700 mb-8">
              NPR {product.price?.toLocaleString()}
            </p>

            {/* Divider */}
            <div className="h-px bg-stone-100 mb-8" />

            {/* Details */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Condition</span>
                <span className="text-[11px] tracking-wide text-stone-700">{product.condition}</span>
              </div>
              {product.size && (
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Size</span>
                  <span className="text-[11px] tracking-wide text-stone-700">{product.size}</span>
                </div>
              )}
              {product.category?.name && (
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Category</span>
                  <span className="text-[11px] tracking-wide text-stone-700">
                    {product.subcategory?.name
                      ? `${product.category.name} / ${product.subcategory.name}`
                      : product.category.name}
                  </span>
                </div>
              )}
              {product.tier === "luxury" && (
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Tier</span>
                  <span className="text-[11px] tracking-wide text-stone-700 uppercase">Luxury</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-[12px] text-stone-500 leading-relaxed tracking-wide mb-8">
                {product.description}
              </p>
            )}

            {/* Eco impact */}
            {product.ecoSustainability && product.ecoScore != null && (
              <div className="border border-stone-100 p-5 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">Environmental Impact</p>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-green-700 bg-green-50 px-2 py-0.5">
                    Eco {Math.round(product.ecoScore * 100)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {product.ecoSustainability.carbonSavedKg != null && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400">CO₂ Saved</p>
                      <p className="text-[11px] text-stone-700 mt-0.5">{product.ecoSustainability.carbonSavedKg} kg</p>
                    </div>
                  )}
                  {product.ecoSustainability.waterSavedLiters != null && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Water Saved</p>
                      <p className="text-[11px] text-stone-700 mt-0.5">{product.ecoSustainability.waterSavedLiters} L</p>
                    </div>
                  )}
                  {product.ecoSustainability.wasteDivertedKg != null && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Waste Diverted</p>
                      <p className="text-[11px] text-stone-700 mt-0.5">{product.ecoSustainability.wasteDivertedKg} kg</p>
                    </div>
                  )}
                  {product.ecoSustainability.energySavedKwh != null && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Energy Saved</p>
                      <p className="text-[11px] text-stone-700 mt-0.5">{product.ecoSustainability.energySavedKwh} kWh</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="mt-auto">
              {addErrorMessage && (
                <p className="text-[11px] text-red-600 mb-3 tracking-wide">{addErrorMessage}</p>
              )}

              {isUser ? (
                <div className="space-y-4">
                  {/* Quantity */}
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Quantity</span>
                    <div className="flex items-center border border-stone-200">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors text-sm"
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-[11px] tracking-wide">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors text-sm"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[11px] text-stone-500 ml-auto">
                      NPR {((product.price ?? 0) * quantity).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="w-full py-3.5 bg-stone-900 text-white text-[11px] uppercase tracking-[0.3em] hover:bg-stone-700 disabled:opacity-50 transition-colors"
                  >
                    {adding ? "Adding..." : "Add to Cart"}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  state={{ from: `/products/${id}` }}
                  className="block w-full py-3.5 bg-stone-900 text-white text-[11px] uppercase tracking-[0.3em] text-center hover:bg-stone-700 transition-colors"
                >
                  Sign In to Purchase
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
