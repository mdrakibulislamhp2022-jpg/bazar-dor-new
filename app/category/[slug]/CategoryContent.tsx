"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Product = {
  id: number;
  nameBn: string;
  name?: string;
  image?: string;
  unit: string;
  today: number;
  category?: string;
};

export default function CategoryContent() {
  const params = useParams();
  const slug = params.slug as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("default");

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      try {
        const response = await fetch(
          `https://openapi.programming-hero.com/api/bazardor/products?category=${slug}`
        );

        const result = await response.json();

        let data: Product[] = [];

        if (Array.isArray(result)) {
          data = result;
        } else if (Array.isArray(result.data)) {
          data = result.data;
        } else if (Array.isArray(result.Data)) {
          data = result.Data;
        } else if (Array.isArray(result.products)) {
          data = result.products;
        }

        setProducts(data);
      } catch (error) {
        console.error("Product loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "low") return a.today - b.today;
    if (sort === "high") return b.today - a.today;
    return 0;
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="text-2xl font-bold text-green-700">
          🛒 বাজার দর
        </a>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {slug === "chal" ? "চালের বাজার" : `${slug} ক্যাটাগরি`}
            </h1>

            <p className="mt-2 text-gray-600">
              নিত্যপ্রয়োজনীয় পণ্যের আজকের দাম দেখুন।
            </p>
          </div>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3"
            aria-label="দাম অনুযায়ী সাজান"
          >
            <option value="default">ডিফল্ট সাজানো</option>
            <option value="low">কম দাম থেকে বেশি</option>
            <option value="high">বেশি দাম থেকে কম</option>
          </select>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg text-gray-600">
              এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।
            </p>

            <a
              href="/"
              className="mt-5 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white"
            >
              সব পণ্য দেখুন
            </a>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProducts.map((product) => (
              <article
                key={product.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-5xl" aria-hidden="true">
                  {product.image || "🛒"}
                </div>

                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {product.nameBn || product.name || "পণ্যের নাম"}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  একক: {product.unit || "প্রযোজ্য নয়"}
                </p>

                <p className="mt-4 text-2xl font-bold text-green-700">
                  ৳{Number(product.today).toLocaleString("bn-BD")}
                  <span className="ml-1 text-sm font-normal text-gray-500">
                    / {product.unit}
                  </span>
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}