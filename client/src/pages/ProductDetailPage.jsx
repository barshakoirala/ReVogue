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
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data: product, isLoading, error } = useGetProductQuery(id);
  const [addToCart, { isLoading: adding, error: addError }] = useAddToCartMutation();

  const isUser = !!token && user?.role === "user";

  if (isLoading) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50 flex items-center justify-center`}>
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4`}>
        <p className="text-stone-500">Product not found</p>
        <Link to="/" className={`${CLASSES.accentLink} font-medium`}>
          Back to home
        </Link>
      </div>
    );
  }

  const imageUrl = product.images?.[0] || "https://picsum.photos/600/600?random=1";

  const handleAddToCart = async () => {
    try {
      await addToCart({ productId: id, quantity }).unwrap();
    } catch {
      // error shown via addError
    }
  };

  const addErrorMessage = addError?.data?.message || addError?.message || (addError && "Failed to add to cart");

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader showBack />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden">
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            {product.tier === "luxury" && (
              <span className={`inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${CLASSES.luxuryBadge} rounded mb-3`}>
                Luxury
              </span>
            )}
            {product.brand?.name && (
              <p className="text-sm text-stone-500 uppercase tracking-wider mb-1">
                {product.brand.name}
              </p>
            )}
            <h1 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900 mb-2`}>
              {product.title}
            </h1>
            <p className="text-xl font-medium text-stone-900 mb-4">
              NPR {product.price?.toLocaleString()}
            </p>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-stone-500">Condition</dt>
                <dd className="font-medium text-stone-900">{product.condition}</dd>
              </div>
              {product.size && (
                <div>
                  <dt className="text-stone-500">Size</dt>
                  <dd className="font-medium text-stone-900">{product.size}</dd>
                </div>
              )}
              {product.category?.name && (
                <div>
                  <dt className="text-stone-500">Category</dt>
                  <dd className="font-medium text-stone-900">
                    {product.subcategory?.name
                      ? `${product.category.name} / ${product.subcategory.name}`
                      : product.category.name}
                  </dd>
                </div>
              )}
            </dl>
            {product.description && (
              <p className="mt-4 text-stone-600">{product.description}</p>
            )}
            <div className="mt-6 pt-6 border-t border-stone-200">
              {isUser ? (
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="text-sm text-stone-600">Quantity</label>
                    <div className="flex items-center border border-stone-300 rounded-md">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="w-9 h-9 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-stone-600 mb-4">
                    Subtotal: <span className="font-semibold text-stone-900">NPR {((product.price ?? 0) * quantity).toLocaleString()}</span>
                  </p>
                  {addErrorMessage && (
                    <p className="text-sm text-red-600 mb-3">{addErrorMessage}</p>
                  )}
                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className={`w-full sm:w-auto px-8 py-3 ${CLASSES.primaryButtonDark} text-sm font-medium tracking-wider uppercase disabled:opacity-70 transition-colors`}
                  >
                    {adding ? "Adding…" : "Add to cart"}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  state={{ from: `/products/${id}` }}
                  className={`inline-block px-8 py-3 ${CLASSES.primaryButtonDark} text-sm font-medium tracking-wider uppercase transition-colors`}
                >
                  Sign in to add to cart
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
