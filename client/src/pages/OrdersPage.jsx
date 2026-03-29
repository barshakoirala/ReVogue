import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import { useGetMyOrdersQuery } from "../store/api/orderApi";
import UserHeader from "../components/UserHeader";
import { CLASSES } from "../constants/theme";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function orderNeedsPayment(order) {
  return order.paymentStatus === "pending";
}

export default function OrdersPage() {
  const [searchParams] = useSearchParams();
  const showSuccess = searchParams.get("success") === "1";
  const showPaid = searchParams.get("paid") === "1";

  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data: orders = [], isLoading } = useGetMyOrdersQuery(undefined, { skip: !token });

  const isUser = !!token && user?.role === "user";

  if (!token || !isUser) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <UserHeader showBack />
        <main className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-stone-600 mb-4">Sign in to view your orders</p>
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
          <p className="text-stone-500">Loading orders…</p>
        </main>
      </div>
    );
  }

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader showBack />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900 mb-6`}>
          My orders
        </h1>

        {showPaid && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
            Payment received. Your order is confirmed.
          </div>
        )}

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
            Order placed successfully. Thank you for shopping with ReVogue.
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <p className="text-stone-600 mb-4">You haven&apos;t placed any orders yet</p>
            <Link
              to="/browse/all"
              className={`inline-block px-6 py-2 ${CLASSES.primaryButtonDark} text-sm font-medium`}
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden"
              >
                <div className="p-4 flex flex-wrap justify-between items-center gap-4 border-b border-stone-100">
                  <div>
                    <span className="text-sm text-stone-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                    <span className="mx-2 text-stone-300">•</span>
                    <span className="text-sm font-medium text-stone-900">
                      Order #{order._id?.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {orderNeedsPayment(order) && (
                      <Link
                        to={`/orders/${order._id}/pay`}
                        className="px-2 py-0.5 text-xs font-medium rounded bg-revogue-purple/10 text-revogue-purple hover:bg-revogue-purple/20"
                      >
                        Pay now
                      </Link>
                    )}
                    {orderNeedsPayment(order) && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-orange-100 text-orange-900">
                        Payment due
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <span className="text-sm font-semibold text-stone-900">
                      NPR {order.subtotal?.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    {(order.items ?? []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 items-center text-sm"
                      >
                        {item.product?.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt=""
                            className="w-12 h-12 object-cover rounded bg-stone-100"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-stone-900 truncate">
                            {item.product?.title ?? "Product"}
                          </p>
                          <p className="text-stone-500 text-xs">
                            {item.product?.brand?.name}
                            {item.quantity > 1 && ` × ${item.quantity}`}
                          </p>
                        </div>
                        <p className="text-stone-700 font-medium">
                          NPR {((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  {order.shippingAddress && (
                    <div className="pt-3 border-t border-stone-100 text-sm text-stone-600">
                      <p className="font-medium text-stone-700 mb-1">Shipping address</p>
                      <p>{order.shippingAddress.fullName}</p>
                      <p>
                        {[order.shippingAddress.addressLine1, order.shippingAddress.addressLine2]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <p>
                        {[order.shippingAddress.city, order.shippingAddress.state]
                          .filter(Boolean)
                          .join(", ")}
                        {order.shippingAddress.postalCode && ` ${order.shippingAddress.postalCode}`}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      {order.shippingAddress.phone && (
                        <p className="mt-1 text-stone-500">Phone: {order.shippingAddress.phone}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
