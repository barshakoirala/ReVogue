import { useGetProductsQuery } from "../../store/api/adminApi";

export default function AdminProducts() {
  const { data: products = [], isLoading } = useGetProductsQuery();

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Products</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Products</h1>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0] || "https://picsum.photos/64/64"}
                      alt=""
                      className="w-12 h-12 rounded object-cover bg-gray-100"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{product.title}</p>
                      {product.brand?.name && (
                        <p className="text-xs text-gray-500">{product.brand.name}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {product.seller?.firstName} {product.seller?.lastName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">NPR {product.price?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      product.tier === "luxury" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {product.tier}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-6 text-center text-gray-500">No products yet.</p>
        )}
      </div>
    </div>
  );
}
