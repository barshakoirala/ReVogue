import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import { ROLES } from "../constants/roles";

export default function UserRoute({ children }) {
  const token = useSelector((state) => state.auth.token);
  const { data: user, isLoading } = useGetMeQuery(undefined, { skip: !token });

  if (!token) {
    return children;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (user?.role === ROLES.ADMIN) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
