"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Market = {
  market?: string;
  division?: string;
  min?: number;
  max?: number;
};

type Product = {
  id: number;
  slug: string;
  nameBn?: string;
  name?: string;
  description?: string;
  categoryNameBn?: string;
  category?: string;
  categoryIcon?: string;
  image?: string;
  unit?: string;
  today?: number;
  yesterday?: number;
  lastWeek?: number;
  lastMonth?: number;
  markets?: Market[];
};

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "https://openapi.programming-hero.com/api/bazardor/products"
        );

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য আনা যায়নি।");
        }

        const result = await response.json();

        const data: Product[] = Array.isArray(result)
          ? result
          : result.data ?? result.Data ?? result.products ?? [];

        const found = data.find((item) => item.slug === slug);

        if (!found) {
          setError("এই পণ্যটি খুঁজে পাওয়া যায়নি।");
        } else {
          setProduct(found);
        }
      } catch {
        setError("পণ্যের তথ্য লোড হয়নি। আবার চেষ্টা করো।");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl animate-pulse rounded-2xl bg-white p-8 shadow">
          <div className="h-8 w-1/2 rounded bg-gray-200" />
          <div className="mt-6 h-32 rounded bg-gray-200" />
          <div className="mt-6 h-6 w-1/3 rounded bg-gray-200" />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {error || "পণ্য পাওয়া যায়নি"}
        </h1>

        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-lg bg-green-700 px-6 py-3 text-white"
        >
          হোম পেজে ফিরে যাও
        </button>
      </main>
    );
  }

  const prices = (product.markets ?? [])
    .flatMap((market) => [market.min, market.max])
    .filter((price): price is number => typeof price === "number");

  const minimum = prices.length ? Math.min(...prices) : null;
  const maximum = prices.length ? Math.max(...prices) : null;
  const average =
    prices.length > 0
      ? Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
      : null;

  const formatPrice = (price: number | null | undefined) =>
    price == null ? "তথ্য নেই" : `৳${price.toLocaleString("bn-BD")}`;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-2xl font-bold text-green-700">
          🛒 বাজার দর
        </a>

        <button
          onClick={() => router.back()}
          className="mt-6 block text-green-700 hover:underline"
        >
          ← আগের পেজে ফিরে যাও
        </button>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="text-6xl">
            {product.image || product.categoryIcon || "🛒"}
          </div>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {product.nameBn || product.name || "পণ্যের নাম"}
          </h1>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
              {product.categoryNameBn || product.category || "পণ্য"}
            </span>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
              একক: {product.unit || "প্রযোজ্য নয়"}
            </span>
          </div>

          <p className="mt-6 text-gray-600">
            {product.description || "এই পণ্যের বিস্তারিত বিবরণ দেওয়া হয়নি।"}
          </p>

          <div className="mt-8 rounded-xl bg-green-50 p-5">
            <p className="text-sm text-gray-600">আজকের দাম</p>

            <p className="mt-1 text-3xl font-bold text-green-700">
              {formatPrice(product.today)}
              <span className="ml-2 text-base font-normal">
                / {product.unit}
              </span>
            </p>
          </div>

          <h2 className="mt-8 text-xl font-bold text-gray-900">
            বাজারদরের সারাংশ
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-4">
              <p className="text-sm text-gray-500">সর্বনিম্ন দাম</p>
              <p className="mt-2 text-xl font-bold text-green-700">
                {formatPrice(minimum)}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-gray-500">সর্বোচ্চ দাম</p>
              <p className="mt-2 text-xl font-bold text-red-600">
                {formatPrice(maximum)}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-gray-500">গড় দাম</p>
              <p className="mt-2 text-xl font-bold text-blue-700">
                {formatPrice(average)}
              </p>
            </div>
          </div>

          <h2 className="mt-10 text-xl font-bold text-gray-900">
            বিভিন্ন বাজারের দাম
          </h2>

          {product.markets && product.markets.length > 0 ? (
            <div className="mt-4 space-y-3">
              {product.markets.map((market, index) => (
                <div
                  key={`${market.market}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {market.market || "স্থানীয় বাজার"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {market.division || ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-green-700">
                      {formatPrice(market.min)} – {formatPrice(market.max)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-500">
              বাজারভিত্তিক দামের তথ্য পাওয়া যায়নি।
            </p>
          )}
        </section>
      </div>
    </main>
  );
}