import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useGetMeQuery } from "../../store/api/authApi";
import { useGetMyProductsQuery } from "../../store/api/vendorProductsApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const ECO_REFERENCE = {
  carbonSavedKg: 12,
  waterSavedLiters: 2500,
  wasteDivertedKg: 1,
  energySavedKwh: 20,
  landUseSavedSqm: 4,
  equivalentItemsAvoided: 1,
  microplasticsAvoidedG: 1.5,
};

const ECO_LABELS = {
  carbonSavedKg: "CO₂ saved (kg)",
  waterSavedLiters: "Water saved (L)",
  wasteDivertedKg: "Waste diverted (kg)",
  energySavedKwh: "Energy saved (kWh)",
  landUseSavedSqm: "Land saved (m²)",
  equivalentItemsAvoided: "Items avoided",
  microplasticsAvoidedG: "Microplastics avoided (g)",
};

const PIE_COLORS = [
  "#059669", "#0d9488", "#0f766e", "#115e59",
  "#134e4a", "#14532d", "#166534",
];

function aggregateEcoFromProducts(products) {
  const totals = {
    carbonSavedKg: 0,
    waterSavedLiters: 0,
    wasteDivertedKg: 0,
    energySavedKwh: 0,
    landUseSavedSqm: 0,
    equivalentItemsAvoided: 0,
    microplasticsAvoidedG: 0,
  };
  for (const p of products || []) {
    const eco = p.ecoSustainability;
    if (!eco) continue;
    if (eco.carbonSavedKg != null) totals.carbonSavedKg += Number(eco.carbonSavedKg);
    if (eco.waterSavedLiters != null) totals.waterSavedLiters += Number(eco.waterSavedLiters);
    if (eco.wasteDivertedKg != null) totals.wasteDivertedKg += Number(eco.wasteDivertedKg);
    if (eco.energySavedKwh != null) totals.energySavedKwh += Number(eco.energySavedKwh);
    if (eco.landUseSavedSqm != null) totals.landUseSavedSqm += Number(eco.landUseSavedSqm);
    if (eco.equivalentItemsAvoided != null) totals.equivalentItemsAvoided += Number(eco.equivalentItemsAvoided);
    if (eco.microplasticsAvoidedG != null) totals.microplasticsAvoidedG += Number(eco.microplasticsAvoidedG);
  }
  return totals;
}

export default function VendorDashboard() {
  const token = useSelector((state) => state.auth.token);
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data: products = [], isLoading } = useGetMyProductsQuery(undefined, { skip: !token });

  const { totals, barData, pieData } = useMemo(() => {
    const t = aggregateEcoFromProducts(products);
    const barData = Object.entries(t).map(([key, value]) => ({
      name: ECO_LABELS[key] || key,
      short: key,
      value: Math.round(value * 100) / 100,
      normalized: Math.round((value / (ECO_REFERENCE[key] || 1)) * 100) / 100,
    }));
    const totalNormalized = barData.reduce((s, d) => s + d.normalized, 0);
    const pieData =
      totalNormalized > 0
        ? barData.map((d) => ({
            name: ECO_LABELS[d.short] || d.short,
            value: Math.round((d.normalized / totalNormalized) * 1000) / 10,
          }))
        : [];
    return { totals: t, barData, pieData };
  }, [products]);

  const hasAnyEco = useMemo(
    () => Object.values(totals).some((v) => v > 0),
    [totals]
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome, {user?.fullName}. This is your vendor dashboard.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link
          to="/vendor/products"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow transition-shadow"
        >
          <h2 className="text-lg font-medium text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your listings</p>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !hasAnyEco ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-amber-900">
          <p className="font-medium">No eco metrics yet</p>
          <p className="text-sm mt-1">
            Add eco sustainability data to your products to see charts and totals here.
          </p>
          <Link
            to="/vendor/products"
            className="inline-block mt-3 text-sm font-medium text-amber-800 hover:underline"
          >
            Go to Products →
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Eco impact summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {totals.carbonSavedKg > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">CO₂ saved</p>
                <p className="text-xl font-semibold text-gray-900 mt-0.5">{totals.carbonSavedKg.toFixed(1)} kg</p>
              </div>
            )}
            {totals.waterSavedLiters > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Water saved</p>
                <p className="text-xl font-semibold text-gray-900 mt-0.5">{totals.waterSavedLiters.toFixed(0)} L</p>
              </div>
            )}
            {totals.wasteDivertedKg > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Waste diverted</p>
                <p className="text-xl font-semibold text-gray-900 mt-0.5">{totals.wasteDivertedKg.toFixed(1)} kg</p>
              </div>
            )}
            {totals.energySavedKwh > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Energy saved</p>
                <p className="text-xl font-semibold text-gray-900 mt-0.5">{totals.energySavedKwh.toFixed(1)} kWh</p>
              </div>
            )}
            {totals.landUseSavedSqm > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Land saved</p>
                <p className="text-xl font-semibold text-gray-900 mt-0.5">{totals.landUseSavedSqm.toFixed(1)} m²</p>
              </div>
            )}
            {totals.equivalentItemsAvoided > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Items avoided</p>
                <p className="text-xl font-semibold text-gray-900 mt-0.5">{totals.equivalentItemsAvoided.toFixed(0)}</p>
              </div>
            )}
            {totals.microplasticsAvoidedG > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Microplastics avoided</p>
                <p className="text-xl font-semibold text-gray-900 mt-0.5">{totals.microplasticsAvoidedG.toFixed(1)} g</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Impact by metric (normalized)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData.filter((d) => d.value > 0)}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${props.payload.value} (normalized: ${props.payload.normalized})`,
                        props.payload.name,
                      ]}
                    />
                    <Bar dataKey="normalized" fill="#059669" radius={[0, 4, 4, 0]} name="Impact (vs reference)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Impact distribution</h3>
              {pieData.length > 0 ? (
                <div className="h-96 min-h-[22rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 50, right: 50, left: 50, bottom: 50 }}>
                      <Pie
                        data={pieData.filter((d) => d.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {pieData.filter((d) => d.value > 0).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No data for pie chart.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Totals (raw values) — bar chart</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData.filter((d) => d.value > 0)}
                  margin={{ top: 5, right: 20, left: 5, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-35} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [value, "Total"]} />
                  <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
