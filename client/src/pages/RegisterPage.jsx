import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "../store/api/authApi";
import { setCredentials } from "../store/slices/authSlice";
import { ROLES } from "../constants/roles";
import { CLASSES } from "../constants/theme";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVendor, setIsVendor] = useState(false);
  const [registerUser, { isLoading, error }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerUser({
      firstName,
      lastName,
      email,
      password,
      role: isVendor ? ROLES.VENDOR : ROLES.USER,
    });
    if (result.data) {
      dispatch(setCredentials({ token: result.data.token }));
      const role = result.data.user?.role;
      if (role === ROLES.ADMIN) navigate("/admin");
      else if (role === ROLES.VENDOR) navigate("/vendor");
      else navigate("/");
    }
  };

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8`}>
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg px-8 pt-8 pb-6">
          <h1 className={`${CLASSES.heading} text-2xl font-semibold text-gray-900 mb-6`}>Create account</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">
                {error?.data?.message || "Registration failed"}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border border-gray-300 rounded ${CLASSES.inputFocus}`}
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border border-gray-300 rounded ${CLASSES.inputFocus}`}
                  placeholder="Last name"
                />
              </div>
            </div>
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
                minLength={6}
                className={`w-full px-3 py-2 border border-gray-300 rounded ${CLASSES.inputFocus}`}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isVendor"
                type="checkbox"
                checked={isVendor}
                onChange={(e) => setIsVendor(e.target.checked)}
                className="rounded border-gray-300 text-revogue-purple focus:ring-revogue-purple"
              />
              <label htmlFor="isVendor" className="text-sm text-gray-700">
                I want to sell on ReVogue
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 ${CLASSES.primaryButton} font-medium rounded focus:ring-2 focus:ring-revogue-purple focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link to="/login" className={`${CLASSES.accentLink} font-medium`}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
