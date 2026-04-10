import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "../store/api/authApi";
import { useGetMyEcoStatsQuery } from "../store/api/orderApi";
import UserHeader from "../components/UserHeader";
import { CLASSES } from "../constants/theme";

const ECO_LEVELS = [
  { name: "Newcomer",       min: 0,   color: "bg-stone-400",   text: "text-stone-600" },
  { name: "Conscious Buyer",min: 5,   color: "bg-green-400",   text: "text-green-700" },
  { name: "Eco Warrior",    min: 20,  color: "bg-emerald-500", text: "text-emerald-700" },
  { name: "Green Hero",     min: 50,  color: "bg-teal-500",    text: "text-teal-700" },
  { name: "Eco Champion",   min: 100, color: "bg-revogue-purple", text: "text-revogue-purple" },
];

function StatCard({ icon, label, value, unit, sub, color }) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-100 p-5 flex flex-col gap-2`}>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-stone-900">
          {value ?? "0"}<span className="text-sm font-normal text-stone-400 ml-1">{unit}</span>
        </p>
        <p className="text-sm font-medium text-stone-700">{label}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function EcoBar({ value, max, color }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 100;
  return (
    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function EcoDashboardPage() {
  const token = useSelector((s) => s.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data, isLoading } = useGetMyEcoStatsQuery(undefined, { skip: !token });

  const isUser = !!token && user?.role === "user";

  if (!token || !isUser) {
    return (
      <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
        <UserHeader />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-4xl mb-4">🌱</p>
          <p className="text-stone-600 mb-4">Sign in to see your eco impact.</p>
          <Link to="/login" className={`${CLASSES.accentLink} font-medium`}>Sign in</Link>
        </main>
      </div>
    );
  }

  const totals = data?.totals ?? {};
  const topItems = data?.topEcoItems ?? [];
  const ecoLevel = data?.ecoLevel ?? "Newcomer";
  const ecoLevelNext = data?.ecoLevelNext;
  const levelInfo = ECO_LEVELS.find((l) => l.name === ecoLevel) ?? ECO_LEVELS[0];
  const nextLevel = ECO_LEVELS.find((l) => l.min === ecoLevelNext);
  const progressPct = ecoLevelNext
    ? Math.min(100, ((totals.carbonSavedKg ?? 0) / ecoLevelNext) * 100)
    : 100;

  // Real-world equivalents
  const treesEquiv = totals.carbonSavedKg ? Math.round(totals.carbonSavedKg / 21) : 0;
  const showersEquiv = totals.waterSavedLiters ? Math.round(totals.waterSavedLiters / 65) : 0;
  const phoneCharges = totals.energySavedKwh ? Math.round(totals.energySavedKwh * 83) : 0;

  return (
    <div className={`${CLASSES.userWrapper} min-h-screen bg-stone-50`}>
      <UserHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="mb-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-7 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 text-[120px] opacity-10 leading-none select-none">🌍</div>
          <p className="text-xs uppercase tracking-widest text-green-200 mb-1">Your impact</p>
          <h1 className={`${CLASSES.heading} text-3xl font-semibold mb-1`}>Eco Dashboard</h1>
          <p className="text-green-100 text-sm max-w-md">
            Every second-hand purchase you make saves resources and reduces waste. Here's your contribution to a more sustainable fashion world.
          </p>
          {isLoading ? null : (
            <div className="mt-5 flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white`}>
                🏅 {ecoLevel}
              </span>
              {totals.itemsBought > 0 && (
                <span className="text-xs text-green-200">{totals.itemsBought} item{totals.itemsBought !== 1 ? "s" : ""} purchased</span>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : totals.itemsBought === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
            <p className="text-5xl mb-4">🛍️</p>
            <h2 className={`${CLASSES.heading} text-xl font-semibold text-stone-900 mb-2`}>No purchases yet</h2>
            <p className="text-stone-500 text-sm mb-6">Buy second-hand items to start tracking your eco impact.</p>
            <Link to="/browse" className={`px-6 py-2.5 ${CLASSES.primaryButton} text-sm font-medium rounded-lg`}>
              Browse products
            </Link>
          </div>
        ) : (
          <>
            {/* Main stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon="🌿" label="CO₂ Saved" value={totals.carbonSavedKg} unit="kg" sub={`≈ ${treesEquiv} trees planted`} color="bg-green-100" />
              <StatCard icon="💧" label="Water Saved" value={totals.waterSavedLiters?.toLocaleString()} unit="L" sub={`≈ ${showersEquiv} showers`} color="bg-blue-100" />
              <StatCard icon="♻️" label="Waste Diverted" value={totals.wasteDivertedKg} unit="kg" sub="from landfill" color="bg-amber-100" />
              <StatCard icon="⚡" label="Energy Saved" value={totals.energySavedKwh} unit="kWh" sub={`≈ ${phoneCharges.toLocaleString()} phone charges`} color="bg-yellow-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Eco level card */}
              <div className="bg-white rounded-2xl border border-stone-100 p-5">
                <h2 className="text-sm font-semibold text-stone-700 mb-4">Your eco level</h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${levelInfo.color} flex items-center justify-center text-2xl`}>
                    🏅
                  </div>
                  <div>
                    <p className={`text-base font-bold ${levelInfo.text}`}>{ecoLevel}</p>
                    <p className="text-xs text-stone-400">
                      {totals.carbonSavedKg} kg CO₂ saved
                    </p>
                  </div>
                </div>
                {ecoLevelNext && (
                  <>
                    <div className="flex justify-between text-xs text-stone-400 mb-1">
                      <span>{totals.carbonSavedKg} kg</span>
                      <span>{ecoLevelNext} kg → {nextLevel?.name}</span>
                    </div>
                    <EcoBar value={totals.carbonSavedKg} max={ecoLevelNext} color={levelInfo.color} />
                  </>
                )}
                {!ecoLevelNext && (
                  <p className="text-xs text-green-600 font-medium mt-2">🎉 Maximum level reached!</p>
                )}
                <div className="mt-4 pt-4 border-t border-stone-100 space-y-1">
                  {ECO_LEVELS.map((l) => (
                    <div key={l.name} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${l.color}`} />
                      <span className={`text-xs ${ecoLevel === l.name ? "font-semibold text-stone-900" : "text-stone-400"}`}>
                        {l.name} {l.min > 0 ? `(${l.min}+ kg)` : ""}
                      </span>
                      {ecoLevel === l.name && <span className="text-xs text-green-600">← you</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sustainability score */}
              <div className="bg-white rounded-2xl border border-stone-100 p-5">
                <h2 className="text-sm font-semibold text-stone-700 mb-4">Sustainability score</h2>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0fdf4" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke="#16a34a" strokeWidth="3"
                        strokeDasharray={`${(totals.avgEcoScore ?? 0) * 100} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-stone-900">
                        {totals.avgEcoScore ? Math.round(totals.avgEcoScore * 100) : 0}
                      </span>
                      <span className="text-xs text-stone-400">/ 100</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-stone-500 text-center">Average eco score across your purchases</p>
                <div className="mt-4 space-y-2">
                  {totals.microplasticsAvoidedG > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-500">Microplastics avoided</span>
                      <span className="font-medium text-stone-800">{totals.microplasticsAvoidedG} g</span>
                    </div>
                  )}
                  {totals.recycledContentPercent > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-500">Avg recycled content</span>
                      <span className="font-medium text-stone-800">{totals.recycledContentPercent}%</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Orders placed</span>
                    <span className="font-medium text-stone-800">{totals.ordersCount}</span>
                  </div>
                </div>
              </div>

              {/* Real world impact */}
              <div className="bg-white rounded-2xl border border-stone-100 p-5">
                <h2 className="text-sm font-semibold text-stone-700 mb-4">Real-world equivalents</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-stone-500">🌳 Trees worth of CO₂</span>
                      <span className="font-semibold text-stone-800">{treesEquiv}</span>
                    </div>
                    <EcoBar value={treesEquiv} max={Math.max(treesEquiv, 10)} color="bg-green-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-stone-500">🚿 Showers of water</span>
                      <span className="font-semibold text-stone-800">{showersEquiv}</span>
                    </div>
                    <EcoBar value={showersEquiv} max={Math.max(showersEquiv, 10)} color="bg-blue-400" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-stone-500">📱 Phone charges</span>
                      <span className="font-semibold text-stone-800">{phoneCharges.toLocaleString()}</span>
                    </div>
                    <EcoBar value={phoneCharges} max={Math.max(phoneCharges, 100)} color="bg-yellow-400" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-stone-500">👕 Items kept from landfill</span>
                      <span className="font-semibold text-stone-800">{totals.itemsBought}</span>
                    </div>
                    <EcoBar value={totals.itemsBought} max={Math.max(totals.itemsBought, 10)} color="bg-amber-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Top eco items */}
            {topItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-6">
                <h2 className="text-sm font-semibold text-stone-700 mb-4">Your most sustainable purchases</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {topItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl flex-shrink-0">🌿</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{item.title}</p>
                        {item.brand && <p className="text-xs text-stone-400">{item.brand}</p>}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs font-semibold text-green-700">
                            {Math.round(item.ecoScore * 100)}% eco
                          </span>
                          {item.carbonSavedKg > 0 && (
                            <span className="text-xs text-stone-400">· {item.carbonSavedKg} kg CO₂</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className={`${CLASSES.heading} text-lg font-semibold text-stone-900`}>Keep making a difference</h3>
                <p className="text-sm text-stone-500 mt-0.5">Every second-hand purchase counts. Browse more sustainable fashion.</p>
              </div>
              <Link to="/browse" className={`flex-shrink-0 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors`}>
                Shop now
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
