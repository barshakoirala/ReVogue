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
    <div className={`${CLASSES.userWrapper} min-h-screen flex flex-col bg-stone-50`}>
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-stone-200 bg-white">
        <Link to="/" className="flex items-center gap-1 group">
          <span className="text-sm text-stone-500 group-hover:text-stone-700 transition-colors">←</span>
          <span className={`${CLASSES.accentLink} text-sm font-medium`}>Back to home</span>
        </Link>
        <Link to="/" className={`${CLASSES.heading} text-xl font-semibold tracking-wide text-stone-900`}>
          Re<span className="text-revogue-gold">VOGUE</span>
        </Link>
        <div className="w-24" />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm px-8 pt-8 pb-8">
            <div className="mb-7 text-center">
              <h1 className={`${CLASSES.heading} text-2xl font-semibold text-stone-900`}>Create account</h1>
              <p className="text-sm text-stone-500 mt-1">Join ReVogue and start shopping sustainably</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                  {error?.data?.message || "Registration failed. Please try again."}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-stone-700 mb-1.5">
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={`w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm ${CLASSES.inputFocus} transition-colors`}
                    placeholder="First"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-stone-700 mb-1.5">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={`w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm ${CLASSES.inputFocus} transition-colors`}
                    placeholder="Last"
                  />
                </div>
              </div>

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
                  minLength={6}
                  className={`w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-sm ${CLASSES.inputFocus} transition-colors`}
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Vendor toggle */}
              <label
                htmlFor="isVendor"
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  isVendor ? "border-revogue-purple bg-revogue-purple/5" : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input
                  id="isVendor"
                  type="checkbox"
                  checked={isVendor}
                  onChange={(e) => setIsVendor(e.target.checked)}
                  className="mt-0.5 rounded border-stone-300 text-revogue-purple focus:ring-revogue-purple"
                />
                <div>
                  <p className="text-sm font-medium text-stone-800">I want to sell on ReVogue</p>
                  <p className="text-xs text-stone-500 mt-0.5">Create a vendor account to list your items</p>
                </div>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2.5 px-4 ${CLASSES.primaryButton} text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-stone-100 text-center">
              <p className="text-sm text-stone-500">
                Already have an account?{" "}
                <Link to="/login" className={`${CLASSES.accentLink} font-medium`}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
