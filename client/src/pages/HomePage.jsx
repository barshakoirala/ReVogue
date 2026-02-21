import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import { logout } from "../store/slices/authSlice";
import { authApi } from "../store/api/authApi";

export default function HomePage() {
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(authApi.util.resetApiState());
    navigate("/login");
  };

  const isAuthenticated = !!token;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-gray-900">
            ReVogue
          </Link>
          <nav className="flex gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600 py-2">{user?.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Sign in
                </Link>
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">ReVogue</h1>
        <p className="text-gray-600 mb-8">
          Sustainable second-hand clothing platform
        </p>
        {isAuthenticated ? (
          <p className="text-gray-700">Welcome back, {user?.fullName}.</p>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50"
            >
              Sign up
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
