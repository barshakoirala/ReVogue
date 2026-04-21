import "dotenv/config";

/**
 * eSewa Epay **v2** UAT (from https://developer.esewa.com.np/pages/Test-credentials).
 * Older Epay docs show a trailing "(" — that key will not validate on rc-epay (ES104).
 */
const ESEWA_UAT_PRODUCT_CODE = "EPAYTEST";
const ESEWA_UAT_SECRET_KEY = "8gBm/:&EnhH.1/q";
/** Copy-paste typo from legacy doc; normalize so existing .env still works. */
const ESEWA_UAT_SECRET_LEGACY_TYPO = "8gBm/:&EnhH.1/q(";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Public sandbox example secret from Khalti cURL samples (https://docs.khalti.com/khalti-epayment/).
 * Use only for local/dev; production must use your key from https://admin.khalti.com/
 */
const KHALTI_DOC_SANDBOX_SECRET = "05bf95cc57244045b8df5fad06748dab";

function normalizeKhaltiSecret(raw) {
  if (!raw || typeof raw !== "string") return "";
  const t = raw.trim();
  return t.replace(/^(Key|key)\s+/i, "").trim();
}

function resolveKhaltiSecretKey() {
  const fromEnv = normalizeKhaltiSecret(
    process.env.KHALTI_SECRET_KEY || process.env.KHALTI_LIVE_SECRET_KEY || ""
  );
  if (fromEnv) return fromEnv;
  if (!isProduction) return KHALTI_DOC_SANDBOX_SECRET;
  return "";
}

function resolveEsewaSecretKey(fromEnv, fallback) {
  const raw = fromEnv || fallback;
  if (raw === ESEWA_UAT_SECRET_LEGACY_TYPO) return ESEWA_UAT_SECRET_KEY;
  return raw;
}

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/revogue",
  jwtSecret: process.env.JWT_SECRET || "revogue-dev-secret-change-in-production",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  /** Public URL of the SPA (used for Khalti return_url and eSewa redirects). */
  clientAppUrl: (process.env.CLIENT_APP_URL || "http://localhost:5173").replace(/\/$/, ""),
  esewa: {
    productCode: process.env.ESEWA_PRODUCT_CODE || (!isProduction ? ESEWA_UAT_PRODUCT_CODE : ""),
    secretKey: resolveEsewaSecretKey(
      process.env.ESEWA_SECRET_KEY,
      !isProduction ? ESEWA_UAT_SECRET_KEY : ""
    ),
    /** `uat` uses rc-epay URLs; `production` uses live ePay. */
    env: process.env.ESEWA_ENV === "production" ? "production" : "uat",
  },
  khalti: {
    secretKey: resolveKhaltiSecretKey(),
    env: process.env.KHALTI_ENV === "production" ? "production" : "sandbox",
  },
  /** LiveKit (voice/text rooms; tokens minted server-side only) */
  livekitUrl: (process.env.LIVEKIT_URL || "").trim(),
  livekitApiKey: (process.env.LIVEKIT_API_KEY || "").trim(),
  livekitApiSecret: (process.env.LIVEKIT_API_SECRET || "").trim(),
  livekitAgentName: (process.env.LIVEKIT_AGENT_NAME || "revogue-chat").trim(),
};
