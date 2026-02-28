import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetDonationsQuery } from "../../store/api/adminApi";

const STATUS_LABELS = {
  pending: "Pending",
  received: "Received",
  disposed: "Disposed",
};

export default function AdminDonations() {
  const [donorFilter, setDonorFilter] = useState("");
  const navigate = useNavigate();
  const { data, isLoading } = useGetDonationsQuery(donorFilter || undefined);

  const donations = data?.donations ?? [];
  const donors = data?.donors ?? [];

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Donations</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Donations</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="admin-donor-filter" className="text-sm text-gray-600">
            Filter by user:
          </label>
          <select
            id="admin-donor-filter"
            value={donorFilter}
            onChange={(e) => setDonorFilter(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All users</option>
            {donors.map((u) => (
              <option key={u._id} value={u._id}>
                {[u.firstName, u.lastName].filter(Boolean).join(" ") || u.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Item
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Donor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {donations.map((d) => (
              <tr
                key={d._id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/admin/donations/${d._id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/admin/donations/${d._id}`);
                  }
                }}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {d.images?.[0] ? (
                      <img
                        src={d.images[0]}
                        alt=""
                        className="w-12 h-12 rounded object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{d.title}</p>
                      {d.description && (
                        <p className="text-xs text-gray-500 max-w-[200px] truncate">
                          {d.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {d.donor ? (
                    <>
                      <p>
                        {[d.donor.firstName, d.donor.lastName].filter(Boolean).join(" ") ||
                          "—"}
                      </p>
                      {d.donor.email && (
                        <p className="text-xs text-gray-500">{d.donor.email}</p>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {d.category || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      d.status === "received"
                        ? "bg-green-100 text-green-800"
                        : d.status === "disposed"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {STATUS_LABELS[d.status] ?? d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {d.createdAt
                    ? new Date(d.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {donations.length === 0 && (
          <p className="p-6 text-center text-gray-500">
            {donorFilter ? "No donations from this user." : "No donations yet."}
          </p>
        )}
      </div>
    </div>
  );
}
