import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../store/api/authApi";
import { setCredentials } from "../store/slices/authSlice";
import { ROLES } from "../constants/roles";
import { CLASSES } from "../constants/theme";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({ email, password });
    if (result.data) {
      dispatch(setCredentials({ token: result.data.token }));
      const role = result.data.user?.role;
      if (role === ROLES.ADMIN) navigate("/admin");
      else if (role === ROLES.VENDOR) navigate("/vendor");
      else navigate("/");
    }
  };

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen flex flex-col bg-stone-50`}>
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-stone-200 bg-white">
        <Link to="/" className="flex items-center gap-1 group">
          <span className="text-sm text-stone-500 group-hover:text-stone-700 transition-colors">←</span>
          <span className={`${CLASSES.accentLink} text-sm font-medium`}>Back to home</span>
        </Link>
        <Link to="/" className="block flex-shrink-0">
            <span
              style={{ fontFamily: "'Tenor Sans', sans-serif", letterSpacing: "0.22em" }}
              className="text-[15px] uppercase text-stone-900 tracking-[0.22em] font-normal"
            >
              Re<span style={{ letterSpacing: "0.28em" }}>VOGUE</span>
            </span>
          </Link>
        <div className="w-24" />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm px-8 pt-8 pb-8">
            <div className="mb-7 text-center">
              <h1 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900`}>Welcome back</h1>
              <p className="text-sm text-stone-500 mt-1">Sign in to your ReVogue account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                  {error?.data?.message || "Sign in failed. Please check your credentials."}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm ${CLASSES.inputFocus} transition-colors`}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm ${CLASSES.inputFocus} transition-colors`}
                  placeholder="Your password"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2.5 px-4 ${CLASSES.primaryButton} text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-stone-100 text-center space-y-2">
              <p className="text-sm text-stone-500">
                No account?{" "}
                <Link to="/register" className={`${CLASSES.accentLink} font-medium`}>
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
