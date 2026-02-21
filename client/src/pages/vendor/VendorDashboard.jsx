import { useSelector } from "react-redux";
import { useGetMeQuery } from "../../store/api/authApi";
import { Link } from "react-router-dom";

export default function VendorDashboard() {
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome, {user?.fullName}. This is your vendor dashboard.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/vendor/products"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md"
        >
          <h2 className="text-lg font-medium text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your listings</p>
        </Link>
      </div>
    </div>
  );
}
