import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "../../store/api/authApi";
import { useGetProductsQuery, useGetCategoriesQuery, useGetBrandsQuery, useGetDonationsQuery } from "../../store/api/adminApi";

function StatCard({ label, value, sub, to, color }) {
  return (
    <Link
      to={to}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 text-lg`}>
        {sub}
      </div>
      <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{value ?? "—"}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </Link>
  );
}

export default function AdminDashboard() {
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data: products = [] } = useGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const { data: donationData } = useGetDonationsQuery();

  const donations = donationData?.donations ?? [];
  const luxuryCount = products.filter((p) => p.tier === "luxury").length;
  const normalCount = products.filter((p) => p.tier === "normal").length;
  const pendingDonations = donations.filter((d) => d.status === "pending").length;
  const subcategoryCount = categories.reduce((acc, c) => acc + (c.subcategories?.length ?? 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.firstName}.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Products" value={products.length} sub="🛍" color="bg-purple-50" to="/admin/products" />
        <StatCard label="Categories" value={categories.length} sub="◈" color="bg-blue-50" to="/admin/categories" />
        <StatCard label="Brands" value={brands.length} sub="✦" color="bg-amber-50" to="/admin/brands" />
        <StatCard label="Donations" value={donations.length} sub="♻" color="bg-green-50" to="/admin/donations" />
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Products by tier</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                <span className="text-sm text-gray-600">Luxury</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{luxuryCount}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-1.5 rounded-full"
                style={{ width: products.length ? `${(luxuryCount / products.length) * 100}%` : "0%" }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
                <span className="text-sm text-gray-600">Normal</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{normalCount}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-gray-400 h-1.5 rounded-full"
                style={{ width: products.length ? `${(normalCount / products.length) * 100}%` : "0%" }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Categories</h2>
          <div className="space-y-2">
            {categories.slice(0, 5).map((cat) => (
              <div key={cat._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.subcategories?.length ?? 0} sub</span>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-gray-400">No categories yet.</p>}
          </div>
          <p className="text-xs text-gray-400 mt-3">{subcategoryCount} subcategories total</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Donations</h2>
          <div className="space-y-2">
            {[["pending", "bg-yellow-400"], ["received", "bg-green-400"], ["disposed", "bg-gray-300"]].map(([status, color]) => {
              const count = donations.filter((d) => d.status === status).length;
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
          {pendingDonations > 0 && (
            <Link to="/admin/donations" className="mt-4 block text-xs text-purple-600 hover:text-purple-800 font-medium">
              {pendingDonations} pending review →
            </Link>
          )}
        </div>
      </div>

      {/* Recent products */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Recent products</h2>
          <Link to="/admin/products" className="text-xs text-purple-600 hover:text-purple-800 font-medium">View all →</Link>
        </div>
        <div className="space-y-3">
          {products.slice(0, 5).map((p) => (
            <div key={p._id} className="flex items-center gap-3">
              <img
                src={p.images?.[0] || "https://picsum.photos/40/40"}
                alt=""
                className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                <p className="text-xs text-gray-400">{p.brand?.name || "No brand"}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">NPR {p.price?.toLocaleString()}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${p.tier === "luxury" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                  {p.tier}
                </span>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-sm text-gray-400">No products yet.</p>}
        </div>
      </div>
    </div>
  );
}
