import { useParams, Link } from "react-router-dom";
import { useGetProductQuery } from "../store/api/productsApi";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, isLoading, error } = useGetProductQuery(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
        <p className="text-stone-500">Product not found</p>
        <Link to="/" className="text-amber-900 font-medium hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const imageUrl = product.images?.[0] || "https://picsum.photos/600/600?random=1";

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            Back to ReVogue
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden">
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            {product.tier === "luxury" && (
              <span className="inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-amber-900/90 text-amber-50 rounded mb-3">
                Luxury
              </span>
            )}
            {product.brand?.name && (
              <p className="text-sm text-stone-500 uppercase tracking-wider mb-1">
                {product.brand.name}
              </p>
            )}
            <h1 className="text-2xl font-semibold text-stone-900 mb-2">
              {product.title}
            </h1>
            <p className="text-xl font-medium text-stone-900 mb-4">
              NPR {product.price?.toLocaleString()}
            </p>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-stone-500">Condition</dt>
                <dd className="font-medium text-stone-900">{product.condition}</dd>
              </div>
              {product.size && (
                <div>
                  <dt className="text-stone-500">Size</dt>
                  <dd className="font-medium text-stone-900">{product.size}</dd>
                </div>
              )}
              {product.category?.name && (
                <div>
                  <dt className="text-stone-500">Category</dt>
                  <dd className="font-medium text-stone-900">
                    {product.subcategory?.name
                      ? `${product.category.name} / ${product.subcategory.name}`
                      : product.category.name}
                  </dd>
                </div>
              )}
            </dl>
            {product.description && (
              <p className="mt-4 text-stone-600">{product.description}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
