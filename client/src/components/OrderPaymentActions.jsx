import { useEffect, useRef, useState } from "react";
import { useInitiateEsewaMutation, useInitiateKhaltiMutation } from "../store/api/paymentApi";

export default function OrderPaymentActions({ order, disabled }) {
  const [initEsewa, { isLoading: esewaLoading }] = useInitiateEsewaMutation();
  const [initKhalti, { isLoading: khaltiLoading }] = useInitiateKhaltiMutation();
  const [esewaSession, setEsewaSession] = useState(null);
  const [actionError, setActionError] = useState("");
  const formRef = useRef(null);
  const busy = disabled || esewaLoading || khaltiLoading;

  useEffect(() => {
    if (esewaSession?.formUrl && formRef.current) {
      formRef.current.submit();
    }
  }, [esewaSession]);

  const handleKhalti = async () => {
    setActionError("");
    try {
      const res = await initKhalti({ orderId: order._id }).unwrap();
      window.location.href = res.paymentUrl;
    } catch (e) {
      setActionError(e?.data?.message || e?.message || "Could not start Khalti payment.");
    }
  };

  const handleEsewa = async () => {
    setActionError("");
    try {
      const res = await initEsewa({ orderId: order._id }).unwrap();
      setEsewaSession({ formUrl: res.formUrl, fields: res.fields });
    } catch (e) {
      setActionError(e?.data?.message || e?.message || "Could not start eSewa payment.");
    }
  };

  return (
    <div className="space-y-3">
      {actionError && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}
      {esewaSession?.formUrl && (
        <form
          key={esewaSession.formUrl + JSON.stringify(esewaSession.fields?.transaction_uuid)}
          ref={formRef}
          action={esewaSession.formUrl}
          method="POST"
          className="hidden"
          aria-hidden
        >
          {Object.entries(esewaSession.fields || {}).map(([name, value]) => (
            <input
              key={name}
              type="hidden"
              name={name}
              defaultValue={value == null ? "" : String(value)}
            />
          ))}
        </form>
      )}
      <p className="text-sm text-stone-600">Pay with a Nepal digital wallet (test keys in dev).</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={handleKhalti}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium text-white bg-[#5C2D91] hover:bg-[#4a2475] disabled:opacity-60 transition-colors`}
        >
          {khaltiLoading ? "Redirecting…" : "Pay with Khalti"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleEsewa}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium text-white bg-[#60BB46] hover:bg-[#4fa038] disabled:opacity-60 transition-colors`}
        >
          {esewaLoading ? "Preparing…" : "Pay with eSewa"}
        </button>
      </div>
      <p className="text-xs text-stone-500">
        eSewa opens in the same tab. After paying, you&apos;ll return here to confirm.
      </p>
    </div>
  );
}
