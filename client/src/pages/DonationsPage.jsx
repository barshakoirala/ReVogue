import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import {
  useGetMyDonationsQuery,
  useCreateDonationMutation,
} from "../store/api/donationApi";
import UserHeader from "../components/UserHeader";
import DonationDetailModal from "../components/DonationDetailModal";
import { CLASSES } from "../constants/theme";

const STATUS_LABELS = {
  pending: "Pending",
  received: "Received",
  disposed: "Disposed",
};

export default function DonationsPage() {
  const [detailId, setDetailId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formImages, setFormImages] = useState([""]);

  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data: donations = [], isLoading } = useGetMyDonationsQuery(undefined, {
    skip: !token,
  });
  const [createDonation, { isLoading: isSubmitting }] = useCreateDonationMutation();

  const isUser = !!token && user?.role === "user";

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    try {
      const imageLinks = formImages.map((u) => u.trim()).filter(Boolean);
      await createDonation({
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory.trim(),
        images: imageLinks,
      }).unwrap();
      setFormTitle("");
      setFormDescription("");
      setFormCategory("");
      setFormImages([""]);
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!token || !isUser) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <UserHeader showBack />
        <main className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-stone-600 mb-4">Sign in to view your donations</p>
          <Link to="/login" className={`${CLASSES.accentLink} font-medium`}>
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader showBack />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900`}>
            My donations
          </h1>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${CLASSES.primaryButton}`}
          >
            Donate an item
          </button>
        </div>

        {isLoading ? (
          <p className="text-stone-500">Loading donations…</p>
        ) : donations.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <p className="text-stone-600 mb-4">You haven&apos;t donated any items yet.</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className={`inline-block px-6 py-2 ${CLASSES.primaryButtonDark} text-sm font-medium`}
            >
              Donate an item
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {donations.map((d) => (
              <li key={d._id}>
                <button
                  type="button"
                  onClick={() => setDetailId(d._id)}
                  className="w-full text-left bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4 hover:border-stone-300 hover:shadow-sm transition-all"
                >
                  {d.images?.[0] ? (
                    <img
                      src={d.images[0]}
                      alt=""
                      className="w-14 h-14 object-cover rounded-lg bg-stone-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-stone-100 flex-shrink-0 flex items-center justify-center text-stone-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`${CLASSES.body} font-medium text-stone-900 truncate`}>
                      {d.title}
                    </p>
                    <p className="text-xs text-stone-500">
                      {d.createdAt
                        ? new Date(d.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${
                      d.status === "received"
                        ? "bg-green-100 text-green-800"
                        : d.status === "disposed"
                          ? "bg-stone-200 text-stone-700"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {STATUS_LABELS[d.status] ?? d.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowForm(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Donate an item"
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`${CLASSES.heading} text-lg font-semibold text-stone-900 mb-4`}>
              Donate an item
            </h2>
            <form onSubmit={handleSubmitDonation} className="space-y-4">
              <div>
                <label htmlFor="donation-title" className="block text-sm font-medium text-stone-700 mb-1">
                  Title *
                </label>
                <input
                  id="donation-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Blue winter jacket"
                  className={`w-full px-3 py-2 border border-stone-300 rounded-lg ${CLASSES.inputFocus}`}
                  required
                />
              </div>
              <div>
                <label htmlFor="donation-desc" className="block text-sm font-medium text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  id="donation-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Condition, size, etc."
                  rows={3}
                  className={`w-full px-3 py-2 border border-stone-300 rounded-lg ${CLASSES.inputFocus}`}
                />
              </div>
              <div>
                <label htmlFor="donation-category" className="block text-sm font-medium text-stone-700 mb-1">
                  Category
                </label>
                <input
                  id="donation-category"
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Jackets, Women"
                  className={`w-full px-3 py-2 border border-stone-300 rounded-lg ${CLASSES.inputFocus}`}
                />
              </div>
              <div>
                <p className="block text-sm font-medium text-stone-700 mb-1">
                  Image links
                </p>
                <p className="text-xs text-stone-500 mb-2">
                  Add one or more image URLs (e.g. from Imgur, Cloudinary, or any public link).
                </p>
                <div className="space-y-2">
                  {formImages.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const next = [...formImages];
                          next[index] = e.target.value;
                          setFormImages(next);
                        }}
                        placeholder={`Image ${index + 1} URL`}
                        className={`flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm ${CLASSES.inputFocus}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formImages.length <= 1) return;
                          setFormImages(formImages.filter((_, i) => i !== index));
                        }}
                        className="px-3 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 text-sm"
                        aria-label="Remove image"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormImages([...formImages, ""])}
                    className="text-sm text-stone-600 hover:text-revogue-purple border border-dashed border-stone-300 rounded-lg px-3 py-2 w-full hover:border-revogue-purple"
                  >
                    + Add another image
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formTitle.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${CLASSES.primaryButton} disabled:opacity-50`}
                >
                  {isSubmitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailId && (
        <DonationDetailModal
          donationId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
