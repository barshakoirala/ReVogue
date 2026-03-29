import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import { useGetOrderByIdQuery } from "../store/api/orderApi";
import UserHeader from "../components/UserHeader";
import OrderPaymentActions from "../components/OrderPaymentActions";
import { CLASSES } from "../constants/theme";

export default function PayOrderPage() {
  const { orderId } = useParams();
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data: order, isLoading, error } = useGetOrderByIdQuery(orderId, { skip: !token || !orderId });

  const isUser = !!token && user?.role === "user";
  const awaiting = order?.paymentStatus === "pending";

  if (!token || !isUser) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <UserHeader showBack />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-stone-600 mb-4">Sign in to pay for your order.</p>
          <Link to="/login" className={CLASSES.accentLink}>
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
          <p className="text-stone-500">Loading order…</p>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <UserHeader showBack />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-stone-600 mb-4">Order not found.</p>
          <Link to="/orders" className={CLASSES.accentLink}>
            My orders
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader showBack />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900 mb-2`}>Pay for order</h1>
        <p className="text-sm text-stone-600 mb-6">
          Order #{order._id?.slice(-6).toUpperCase()} · NPR {order.subtotal?.toLocaleString()}
        </p>

        {awaiting ? (
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <OrderPaymentActions order={order} />
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-green-900 text-sm">
            This order is already paid.
            <Link to="/orders" className={`block mt-4 font-medium ${CLASSES.accentLink}`}>
              View orders
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
