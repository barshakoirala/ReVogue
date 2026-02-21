import { useSelector } from "react-redux";
import { useGetMeQuery } from "../../store/api/authApi";

export default function AdminDashboard() {
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Welcome, {user?.fullName}. This is the admin dashboard.
        </p>
      </div>
    </div>
  );
}
