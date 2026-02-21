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
    <div className={`${CLASSES.userWrapper} min-h-screen flex items-center justify-center bg-gray-50 px-4`}>
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg px-8 pt-8 pb-6">
          <h1 className={`${CLASSES.heading} text-2xl font-semibold text-gray-900 mb-6`}>Sign in</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">
                {error?.data?.message || "Sign in failed"}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded ${CLASSES.inputFocus}`}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded ${CLASSES.inputFocus}`}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 ${CLASSES.primaryButton} font-medium rounded focus:ring-2 focus:ring-revogue-purple focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600 text-center">
            No account?{" "}
            <Link to="/register" className={`${CLASSES.accentLink} font-medium`}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
