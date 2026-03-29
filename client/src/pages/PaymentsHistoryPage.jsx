import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import { useGetMyPaymentsQuery } from "../store/api/paymentApi";
import UserHeader from "../components/UserHeader";
import { CLASSES } from "../constants/theme";

const GATEWAY_LABEL = { esewa: "eSewa", khalti: "Khalti" };

const STATUS_LABEL = {
  initiated: "Started",
  completed: "Completed",
  failed: "Failed",
};

function statusPillClass(status) {
  if (status === "completed") return "bg-green-100 text-green-800";
  if (status === "failed") return "bg-red-100 text-red-800";
  return "bg-amber-100 text-amber-900";
}

function formatWhen(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentsHistoryPage() {
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data: payments = [], isLoading } = useGetMyPaymentsQuery(undefined, { skip: !token });

  const isUser = !!token && user?.role === "user";

  if (!token || !isUser) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <UserHeader showBack />
        <main className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-stone-600 mb-4">Sign in to view payment history.</p>
          <Link to="/login" className={CLASSES.accentLink}>
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader showBack />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900 mb-6`}>
          Payment history
        </h1>

        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-14 text-center text-stone-500 text-sm">Loading…</div>
          ) : payments.length === 0 ? (
            <div className="px-6 py-14 text-center text-stone-600 text-sm">
              No payment attempts yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[640px]">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/90">
                    <th
                      scope="col"
                      className={`${CLASSES.body} px-4 py-3 font-semibold text-stone-700 whitespace-nowrap`}
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className={`${CLASSES.body} px-4 py-3 font-semibold text-stone-700 whitespace-nowrap`}
                    >
                      Gateway
                    </th>
                    <th
                      scope="col"
                      className={`${CLASSES.body} px-4 py-3 font-semibold text-stone-700 whitespace-nowrap text-right`}
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className={`${CLASSES.body} px-4 py-3 font-semibold text-stone-700 whitespace-nowrap`}
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className={`${CLASSES.body} px-4 py-3 font-semibold text-stone-700 whitespace-nowrap`}
                    >
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className={CLASSES.body}>
                  {payments.map((p) => (
                    <tr
                      key={p._id}
                      className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/70 transition-colors"
                    >
                      <td className="px-4 py-3 text-stone-600 whitespace-nowrap align-middle">
                        {formatWhen(p.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-stone-900 font-medium whitespace-nowrap align-middle">
                        {GATEWAY_LABEL[p.gateway] ?? p.gateway}
                      </td>
                      <td className="px-4 py-3 text-stone-900 font-semibold tabular-nums text-right whitespace-nowrap align-middle">
                        NPR {p.amountNpr?.toLocaleString?.() ?? p.amountNpr}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${statusPillClass(p.status)}`}
                        >
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle max-w-[220px]">
                        <span
                          className="block truncate font-mono text-xs text-stone-500"
                          title={p.gatewayTransactionId || undefined}
                        >
                          {p.gatewayTransactionId || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
