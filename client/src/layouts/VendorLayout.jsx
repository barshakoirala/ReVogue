import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import { logout } from "../store/slices/authSlice";
import { authApi } from "../store/api/authApi";

export default function VendorLayout() {
  const location = useLocation();
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(authApi.util.resetApiState());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link to="/vendor" className="text-lg font-semibold">
            ReVogue Vendor
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/vendor"
            className={`block px-3 py-2 rounded ${location.pathname === "/vendor" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
          >
            Dashboard
          </Link>
          <Link
            to="/vendor/products"
            className={`block px-3 py-2 rounded ${location.pathname.startsWith("/vendor/products") ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
          >
            Products
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-gray-400 truncate">{user?.fullName}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white whitespace-nowrap"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
