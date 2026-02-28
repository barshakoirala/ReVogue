import { useGetDonationQuery } from "../store/api/donationApi";
import { CLASSES } from "../constants/theme";

const STATUS_LABELS = {
  pending: "Pending",
  received: "Received",
  disposed: "Disposed",
};

export default function DonationDetailModal({ donationId, onClose }) {
  const { data: donation, isLoading } = useGetDonationQuery(donationId, {
    skip: !donationId,
  });

  if (!donationId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Donation details"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <h2 className={`${CLASSES.heading} text-lg font-semibold text-stone-900`}>
            Donation details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <p className="text-stone-500 text-sm">Loading…</p>
          ) : !donation ? (
            <p className="text-stone-500 text-sm">Donation not found.</p>
          ) : (
            <div className="space-y-4">
              {donation.images?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {donation.images.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg bg-stone-100 flex-shrink-0"
                    />
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-0.5">Title</p>
                <p className={`${CLASSES.body} font-medium text-stone-900`}>{donation.title}</p>
              </div>
              {donation.description && (
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-0.5">Description</p>
                  <p className={`${CLASSES.body} text-stone-700 text-sm`}>{donation.description}</p>
                </div>
              )}
              {donation.category && (
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-0.5">Category</p>
                  <p className={`${CLASSES.body} text-stone-700 text-sm`}>{donation.category}</p>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-stone-500 uppercase tracking-wide">Status</span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    donation.status === "received"
                      ? "bg-green-100 text-green-800"
                      : donation.status === "disposed"
                        ? "bg-stone-200 text-stone-700"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {STATUS_LABELS[donation.status] ?? donation.status}
                </span>
              </div>
              {donation.createdAt && (
                <p className="text-xs text-stone-500">
                  Donated on{" "}
                  {new Date(donation.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
