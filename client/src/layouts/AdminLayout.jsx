import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import { logout } from "../store/slices/authSlice";
import { authApi } from "../store/api/authApi";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "⊞", exact: true },
  { to: "/admin/products", label: "Products", icon: "🛍" },
  { to: "/admin/categories", label: "Categories", icon: "◈" },
  { to: "/admin/brands", label: "Brands", icon: "✦" },
  { to: "/admin/donations", label: "Donations", icon: "♻" },
];

export default function AdminLayout() {
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

  const isActive = (nav) =>
    nav.exact ? location.pathname === nav.to : location.pathname.startsWith(nav.to);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-20">
        <div className="px-5 py-5 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">ReVogue</span>
            <span className="text-xs px-1.5 py-0.5 bg-purple-600 rounded text-white font-medium">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((nav) => (
            <Link
              key={nav.to}
              to={nav.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(nav)
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-base">{nav.icon}</span>
              {nav.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-gray-400 hover:text-white transition-colors px-1"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
