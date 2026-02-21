import { Link } from "react-router-dom";
import { CLASSES } from "../constants/theme";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
} from "../store/api/cartApi";
import UserHeader from "../components/UserHeader";

export default function CartPage() {
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data: cart, isLoading, error } = useGetCartQuery(undefined, { skip: !token });
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveFromCartMutation();

  const isUser = !!token && user?.role === "user";

  if (!token || !isUser) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <UserHeader showBack />
        <main className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-stone-600 mb-4">Sign in to view your cart</p>
          <Link to="/login" className={`${CLASSES.accentLink} font-medium`}>
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <UserHeader showBack />
        <main className="max-w-6xl mx-auto px-4 py-16">
          <p className="text-stone-500">Loading cart…</p>
        </main>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, i) => sum + (i.product?.price ?? 0) * (i.quantity || 0),
    0
  );

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader showBack />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900 mb-6`}>Your cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <p className="text-stone-600 mb-4">Your cart is empty</p>
            <Link
              to="/browse/all"
              className={`inline-block px-6 py-2 ${CLASSES.primaryButtonDark} text-sm font-medium transition-colors`}
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.filter((item) => item.product).map((item) => {
                const p = item.product;
                const img = p?.images?.[0] || "https://picsum.photos/200/200";
                const price = p?.price ?? 0;
                const lineTotal = price * (item.quantity || 0);

                return (
                  <div
                    key={item.product?._id}
                    className="bg-white rounded-xl border border-stone-200 p-4 flex gap-4"
                  >
                    <Link
                      to={`/products/${p?._id}`}
                      className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100"
                    >
                      <img src={img} alt={p?.title} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${p?._id}`} className={`font-medium text-stone-900 ${CLASSES.linkHover}`}>
                        {p?.title}
                      </Link>
                      {p?.brand?.name && (
                        <p className="text-xs text-stone-500 uppercase tracking-wider mt-0.5">
                          {p.brand.name}
                        </p>
                      )}
                      <p className="text-stone-600 mt-1">NPR {price.toLocaleString()} each</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-stone-300 rounded-md">
                          <button
                            type="button"
                            onClick={() =>
                              item.quantity > 1 &&
                              updateItem({ productId: p._id, quantity: item.quantity - 1 })
                            }
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateItem({ productId: p._id, quantity: item.quantity + 1 })
                            }
                            className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(p._id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-stone-900">NPR {lineTotal.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-stone-200 p-6 sticky top-24">
                <h2 className={`${CLASSES.heading} text-lg font-semibold text-stone-900 mb-4`}>Order summary</h2>
                <div className="flex justify-between text-stone-600 mb-2">
                  <span>Subtotal</span>
                  <span>NPR {subtotal.toLocaleString()}</span>
                </div>
                <div className="border-t border-stone-200 pt-4 mt-4">
                  <div className="flex justify-between font-semibold text-stone-900">
                    <span>Total</span>
                    <span>NPR {subtotal.toLocaleString()}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className={`mt-6 block w-full py-3 ${CLASSES.primaryButtonDark} text-center text-sm font-medium tracking-wider uppercase transition-colors`}
                >
                  Proceed to checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
