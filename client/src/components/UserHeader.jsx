import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CLASSES } from "../constants/theme";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import { useGetCartQuery } from "../store/api/cartApi";
import { logout } from "../store/slices/authSlice";
import { authApi } from "../store/api/authApi";

const NAV_LINKS = [
  { to: "/browse", label: "Shop" },
  { to: "/browse?tab=luxury", label: "Luxury" },
  { to: "/browse?tab=normal", label: "Everyday" },
  { to: "/donations", label: "Donate" },
  { to: "/eco", label: "Eco Impact" },
  { to: "/contact", label: "Contact" },
];

export default function UserHeader({ showBack = false, centerContent }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
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

  const isActive = (to) => location.pathname + location.search === to || location.pathname === to.split("?")[0];

  return (
    <header className={`${CLASSES.userWrapper} bg-white sticky top-0 z-20`}>

      {/* ── Row 1: utility bar ── */}
      <div className="border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-between">
          {/* Left: account info */}
          <div className="flex items-center gap-6">
            {token ? (
              <>
                <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hidden sm:block">
                  {user?.firstName} {user?.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700 transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700 transition-colors hidden sm:block">
                  Create account
                </Link>
              </>
            )}
          </div>

          {/* Right: utility links */}
          {isUser && (
            <div className="hidden sm:flex items-center gap-6">
              <Link to="/assistant" className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700 transition-colors">
                Assistant
              </Link>
              <Link to="/orders" className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700 transition-colors">
                My Orders
              </Link>
              <Link to="/payments" className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700 transition-colors">
                Payments
              </Link>
              <Link to="/virtual-wardrobe" className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-700 transition-colors">
                Wardrobe
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: logo + icons ── */}
      <div className="border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo — centered on desktop */}
          <div className="flex-1 flex justify-start md:justify-center">
            <Link to="/" className="block">
              <span
                style={{ fontFamily: "'Tenor Sans', sans-serif", letterSpacing: "0.28em" }}
                className="text-[16px] uppercase text-stone-900 font-normal"
              >
                ReVogue
              </span>
            </Link>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-5">
            {/* Search */}
            <Link to="/search" aria-label="Search" className="text-stone-500 hover:text-stone-900 transition-colors">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </Link>

            {/* Account */}
            {token ? (
              <button onClick={handleLogout} aria-label="Account" className="text-stone-500 hover:text-stone-900 transition-colors">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            ) : (
              <Link to="/login" aria-label="Sign in" className="text-stone-500 hover:text-stone-900 transition-colors">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" aria-label="Cart" className="relative text-stone-500 hover:text-stone-900 transition-colors">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-[14px] h-[14px] flex items-center justify-center text-[8px] font-medium text-white bg-stone-900 rounded-full">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-stone-500 hover:text-stone-900 transition-colors ml-1"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 3: main nav ── */}
      {!centerContent && (
        <div className="hidden md:block border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-center gap-10">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-[10px] uppercase tracking-[0.22em] transition-colors pb-0.5 ${
                  isActive(l.to)
                    ? "text-stone-900 border-b border-stone-900"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Center content row (homepage tier filter) */}
      {centerContent && (
        <div className="hidden md:flex border-b border-stone-100 h-10 items-center justify-center">
          {centerContent}
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-6 py-5 space-y-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="block text-[10px] uppercase tracking-[0.22em] text-stone-600 hover:text-stone-900 py-1"
            >
              {l.label}
            </Link>
          ))}
          {isUser && (
            <>
              <div className="h-px bg-stone-100" />
              <Link to="/assistant" onClick={() => setMenuOpen(false)} className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 py-1">Assistant</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 py-1">My Orders</Link>
              <Link to="/payments" onClick={() => setMenuOpen(false)} className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 py-1">Payments</Link>
              <Link to="/virtual-wardrobe" onClick={() => setMenuOpen(false)} className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 py-1">Wardrobe</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
