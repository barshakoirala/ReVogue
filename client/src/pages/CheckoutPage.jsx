import { useState } from "react";
import { CLASSES } from "../constants/theme";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import { cartApi, useGetCartQuery } from "../store/api/cartApi";
import { useCheckoutMutation } from "../store/api/orderApi";
import UserHeader from "../components/UserHeader";

const INITIAL_FORM = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Nepal",
  phone: "",
};

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);

  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data: cart, isLoading } = useGetCartQuery(undefined, { skip: !token });
  const [checkout, { isLoading: placing }] = useCheckoutMutation();

  const isUser = !!token && user?.role === "user";
  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, i) => sum + (i.product?.price ?? 0) * (i.quantity || 0),
    0
  );

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await checkout(form).unwrap();
      dispatch(cartApi.util.invalidateTags(["Cart"]));
      navigate("/orders?success=1");
    } catch (err) {
      console.error(err);
    }
  };

  if (!token || !isUser) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <UserHeader showBack />
        <main className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-stone-600 mb-4">Sign in to checkout</p>
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
          <p className="text-stone-500">Loading…</p>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <UserHeader showBack />
        <main className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-stone-600 mb-4">Your cart is empty</p>
          <Link to="/browse/all" className={`${CLASSES.accentLink} font-medium`}>
            Continue shopping
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader showBack />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900 mb-6`}>Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h2 className={`${CLASSES.heading} text-lg font-semibold text-stone-900 mb-4`}>Shipping address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Full name</label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Address line 1</label>
                  <input
                    name="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    required
                    className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Address line 2</label>
                  <input
                    name="addressLine2"
                    value={form.addressLine2}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">State / Province</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Postal code</label>
                  <input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Country</label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                    className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white rounded-xl border border-stone-200 p-6 sticky top-24">
              <h2 className={`${CLASSES.heading} text-lg font-semibold text-stone-900 mb-4`}>Order summary</h2>
              <div className="space-y-2 text-sm">
                {items.filter((i) => i.product).map((item) => (
                  <div key={item.product._id} className="flex justify-between">
                    <span className="text-stone-600 line-clamp-1">
                      {item.product.title} × {item.quantity}
                    </span>
                    <span>NPR {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-200 mt-4 pt-4">
                <div className="flex justify-between font-semibold text-stone-900">
                  <span>Total</span>
                  <span>NPR {subtotal.toLocaleString()}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={placing}
                className={`mt-6 w-full py-3 ${CLASSES.primaryButtonDark} text-sm font-medium tracking-wider uppercase disabled:opacity-70 transition-colors`}
              >
                {placing ? "Placing order…" : "Place order"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
