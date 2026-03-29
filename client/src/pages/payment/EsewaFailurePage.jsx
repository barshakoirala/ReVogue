import { Link } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import { CLASSES } from "../../constants/theme";

export default function EsewaFailurePage() {
  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader showBack />
      <main className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <h1 className={`${CLASSES.heading} text-xl font-semibold text-stone-900`}>
          Payment not completed
        </h1>
        <p className="text-stone-600 text-sm">
          The eSewa payment was cancelled or failed. You can try again from your orders page.
        </p>
        <Link to="/orders" className={`inline-block ${CLASSES.primaryButtonDark} px-6 py-2 text-sm font-medium`}>
          View orders
        </Link>
      </main>
    </div>
  );
}
