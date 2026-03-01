import { Link, useNavigate } from "react-router-dom";
import { CLASSES } from "../constants/theme";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import { useGetCartQuery } from "../store/api/cartApi";
import { logout } from "../store/slices/authSlice";
import { authApi } from "../store/api/authApi";

export default function UserHeader({ showBack = false, centerContent }) {
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data: cart } = useGetCartQuery(undefined, { skip: !token });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isUser = !!token && user?.role === "user";
  const cartCount = (cart?.items ?? []).reduce((sum, i) => sum + (i.quantity || 0), 0);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(authApi.util.resetApiState());
    navigate("/login");
  };

  return (
    <header className={`${CLASSES.userWrapper} bg-white border-b border-stone-200 sticky top-0 z-10`}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="block">
            <img src="/revougeee.png" alt="ReVogue" className="h-12 object-contain" />
          </Link>
          <Link
            to="/search"
            className="p-2 text-stone-600 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-100"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>
          {showBack && (
            <Link to="/" className={`text-sm text-stone-600 ${CLASSES.linkHover}`}>
              Back to home
            </Link>
          )}
        </div>
        {centerContent && <div className="flex-1 flex justify-center">{centerContent}</div>}
        <div className="flex items-center gap-6">
          {isUser && (
            <>
              <Link
                to="/orders"
                className={`text-sm text-stone-600 ${CLASSES.linkHover}`}
              >
                My orders
              </Link>
              <Link
                to="/donations"
                className={`text-sm text-stone-600 ${CLASSES.linkHover}`}
              >
                Donations
              </Link>
              <Link
                to="/cart"
              className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors"
              aria-label={`Cart (${cartCount} items)`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-semibold text-white bg-revogue-gold rounded-full px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
            </>
          )}
          <nav className="flex gap-4 items-center">
            {token ? (
              <>
                <span className="text-sm text-stone-600">{user?.fullName}</span>
                <button onClick={handleLogout} className="text-sm text-stone-600 hover:text-stone-900">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-stone-600 hover:text-stone-900">
                  Sign in
                </Link>
                <Link to="/register" className={`text-sm font-medium ${CLASSES.accentLink}`}>
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
