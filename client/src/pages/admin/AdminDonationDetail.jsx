import { Link, useParams } from "react-router-dom";
import { useGetDonationQuery } from "../../store/api/adminApi";

const STATUS_LABELS = {
  pending: "Pending",
  received: "Received",
  disposed: "Disposed",
};

export default function AdminDonationDetail() {
  const { id } = useParams();
  const { data: donation, isLoading, error } = useGetDonationQuery(id, {
    skip: !id,
  });

  if (!id) {
    return (
      <div>
        <p className="text-gray-500">Invalid donation.</p>
        <Link to="/admin/donations" className="text-indigo-600 hover:underline mt-2 inline-block">
          ← Back to Donations
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div>
        <p className="text-gray-500">Donation not found.</p>
        <Link to="/admin/donations" className="text-indigo-600 hover:underline mt-2 inline-block">
          ← Back to Donations
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/admin/donations"
        className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block"
      >
        ← Back to Donations
      </Link>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">{donation.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                donation.status === "received"
                  ? "bg-green-100 text-green-800"
                  : donation.status === "disposed"
                    ? "bg-gray-200 text-gray-700"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {STATUS_LABELS[donation.status] ?? donation.status}
            </span>
            {donation.createdAt && (
              <span className="text-sm text-gray-500">
                {new Date(donation.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
        <div className="p-6 space-y-6">
          {donation.images?.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Images</h2>
              <div className="flex flex-wrap gap-3">
                {donation.images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-32 h-32 object-cover rounded-lg bg-gray-100"
                  />
                ))}
              </div>
            </div>
          )}
          {donation.description && (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-1">Description</h2>
              <p className="text-gray-900">{donation.description}</p>
            </div>
          )}
          {donation.category && (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-1">Category</h2>
              <p className="text-gray-900">{donation.category}</p>
            </div>
          )}
          {donation.donor && (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-1">Donor</h2>
              <div className="text-gray-900">
                <p>
                  {[donation.donor.firstName, donation.donor.lastName]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </p>
                {donation.donor.email && (
                  <p className="text-sm text-gray-600">{donation.donor.email}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
