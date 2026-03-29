import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useVerifyKhaltiMutation } from "../../store/api/paymentApi";
import UserHeader from "../../components/UserHeader";
import { CLASSES } from "../../constants/theme";

export default function KhaltiReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [verify, { isLoading }] = useVerifyKhaltiMutation();
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (!token) return;
    if (ran.current) return;
    ran.current = true;

    const pidx = searchParams.get("pidx");
    if (!pidx) {
      setMessage("Missing payment reference (pidx).");
      return;
    }

    (async () => {
      try {
        await verify({ pidx }).unwrap();
        navigate("/orders?paid=1", { replace: true });
      } catch (e) {
        setMessage(e?.data?.message || e?.message || "Payment verification failed.");
      }
    })();
  }, [token, searchParams, verify, navigate]);

  if (!token) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <UserHeader showBack />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-stone-600 mb-4">Sign in to complete payment verification.</p>
          <Link to="/login" className={CLASSES.accentLink}>
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader showBack />
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        {isLoading && !message && <p className="text-stone-600">Confirming payment with Khalti…</p>}
        {message && (
          <>
            <p className="text-red-700 text-sm mb-6">{message}</p>
            <Link to="/orders" className={`${CLASSES.accentLink} font-medium`}>
              Back to orders
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
