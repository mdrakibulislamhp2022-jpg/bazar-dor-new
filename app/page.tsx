"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const API_URL = "https://openapi.programming-hero.com/api/bazardor";

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
  category?: string;
  categoryNameBn?: string;
  categoryIcon?: string;
  unit?: string;
  image?: string;
  today?: number;
  yesterday?: number;
  lastWeek?: number;
  lastMonth?: number;
  change?: {
    dir?: string;
    pct?: number;
  };
  markets?: Market[];
};

const categories = [
  { slug: "all", name: "সব পণ্য", icon: "🛒" },
  { slug: "chal", name: "চাল", icon: "🍚" },
  { slug: "dal", name: "ডাল", icon: "🫘" },
  { slug: "tel", name: "তেল", icon: "🫙" },
  { slug: "mach", name: "মাছ", icon: "🐟" },
  { slug: "mangsho", name: "মাংস", icon: "🍗" },
  { slug: "sobji", name: "সবজি", icon: "🥦" },
  { slug: "fol", name: "ফল", icon: "🍎" },
];

const emojiByCategory: Record<string, string> = {
  chal: "🍚",
  dal: "🫘",
  tel: "🫙",
  mach: "🐟",
  mangsho: "🍗",
  sobji: "🥦",
  fol: "🍎",
};

function getProducts(payload: unknown): Product[] {
  if (Array.isArray(payload)) {
    return payload as Product[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const obj = payload as Record<string, unknown>;

  for (const key of ["data", "Data", "products", "result"]) {
    const value = obj[key];

    if (Array.isArray(value)) {
      return value as Product[];
    }

    if (value && typeof value === "object") {
      const nested = getProducts(value);

      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

function formatPrice(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toLocaleString("bn-BD");
}

function getName(product: Product) {
  return product.nameBn || product.name || "পণ্যের নাম";
}

function getEmoji(product: Product) {
  const image = product.image?.trim();

  if (image && !/^https?:\/\//i.test(image)) {
    return image;
  }

  return (
    emojiByCategory[product.category || ""] ||
    product.categoryIcon ||
    "🛒"
  );
}

function getChange(product: Product) {
  const value = Number(product.change?.pct ?? 0);
  const direction = product.change?.dir;

  if (!Number.isFinite(value) || value === 0) {
    return {
      text: "— ০%",
      className: "bg-gray-100 text-gray-600",
    };
  }

  const isUp = direction
    ? direction.toLowerCase() === "up"
    : value > 0;

  return {
    text: `${isUp ? "▲" : "▼"} ${Math.abs(value).toLocaleString("bn-BD")}%`,
    className: isUp
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700",
  };
}

function getUnit(unit?: string) {
  const units: Record<string, string> = {
    kg: "প্রতি কেজি",
    liter: "প্রতি লিটার",
    litre: "প্রতি লিটার",
    l: "প্রতি লিটার",
    piece: "প্রতি পিস",
    pcs: "প্রতি পিস",
    dozen: "প্রতি ডজন",
    bag: "প্রতি বস্তা",
    packet: "প্রতি প্যাকেট",
  };

  return units[(unit || "").toLowerCase()] || `প্রতি ${unit || "একক"}`;
}

function ProductCard({ product }: { product: Product }) {
  const change = getChange(product);
  const emoji = getEmoji(product);

  return (
    <Link
      href={`/product/${product.slug || product.id}`}
      className="group rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-1 hover:border-green-300 hover:shadow-lg"
    >
      <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-green-50">
        {product.image && /^https?:\/\//i.test(product.image) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={getName(product)}
            className="h-28 w-28 object-contain"
          />
        ) : (
          <span className="text-6xl" role="img" aria-label={getName(product)}>
            {emoji}
          </span>
        )}
      </div>

      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-800 group-hover:text-green-700">
          {getName(product)}
        </h3>

        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
          {product.categoryNameBn || product.category || "পণ্য"}
        </span>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        {getUnit(product.unit)}
      </p>

      <div className="flex flex-wrap items-end justify-between gap-2 border-t border-gray-100 pt-3">
        <div>
          <p className="text-xs text-gray-500">আজকের দাম</p>

          <p className="text-xl font-extrabold text-gray-900">
            {formatPrice(product.today)}{" "}
            <span className="text-sm font-medium">টাকা</span>
          </p>
        </div>

        <span
          className={`rounded-full px-2 py-1 text-xs font-bold ${change.className}`}
        >
          {change.text}
        </span>
      </div>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 p-4">
      <div className="mb-4 h-32 rounded-xl bg-gray-100" />
      <div className="mb-3 h-4 w-2/3 rounded bg-gray-100" />
      <div className="mb-5 h-3 w-1/3 rounded bg-gray-100" />
      <div className="h-8 rounded bg-gray-100" />
    </div>
  );
}

export default function HomePage() {  const { data: session, isPending } = authClient.useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
const [banglaDate, setBanglaDate] = useState("");

useEffect(() => {
  setBanglaDate(
    new Intl.DateTimeFormat("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date())
  );
}, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/products`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য লোড করা যায়নি।");
        }

        const json: unknown = await response.json();
        const data = getProducts(json);

        if (data.length === 0) {
          throw new Error("API থেকে কোনো পণ্য পাওয়া যায়নি।");
        }

        setProducts(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" ||
        product.category === activeCategory;

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        getName(product).toLowerCase().includes(query) ||
        (product.categoryNameBn || "").toLowerCase().includes(query) ||
        (product.category || "").toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  const risers = useMemo(() => {
    return [...products]
      .filter(
        (product) =>
          product.change?.dir?.toLowerCase() === "up" &&
          Number(product.change?.pct) > 0
      )
      .sort(
        (a, b) =>
          Number(b.change?.pct || 0) - Number(a.change?.pct || 0)
      )
      .slice(0, 6);
  }, [products]);

 const fallers = useMemo(() => {
  return [...products]
    .filter((product) => {
      const today = Number(product.today);
      const yesterday = Number(product.yesterday);
      const direction = product.change?.dir?.toLowerCase();

      // API-তে direction থাকলে সেটি ব্যবহার করবে।
      // না থাকলে আজ ও গতকালের দাম তুলনা করবে।
      if (direction === "down") {
        return Number(product.change?.pct ?? 0) !== 0;
      }

      if (direction === "up") {
        return false;
      }

      return (
        Number.isFinite(today) &&
        Number.isFinite(yesterday) &&
        today < yesterday
      );
    })
    .sort((a, b) => {
      const changeA = Math.abs(
        Number(a.change?.pct) ||
          ((Number(a.yesterday) - Number(a.today)) /
            Math.max(Number(a.yesterday), 1)) *
            100
      );

      const changeB = Math.abs(
        Number(b.change?.pct) ||
          ((Number(b.yesterday) - Number(b.today)) /
            Math.max(Number(b.yesterday), 1)) *
            100
      );

      return changeB - changeA;
    })
    .slice(0, 6);
}, [products]);

  return (
    <main className="min-h-screen bg-[#f8faf7] text-gray-800">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="shrink-0">
            <div className="text-xl font-extrabold text-green-800 sm:text-2xl">
              🛒 বাজার দর
            </div>
            <p className="mt-1 text-xs text-gray-500">{banglaDate}</p>
          </Link>

          <div className="flex items-center gap-2">
  {isPending ? (
    <span className="text-sm text-gray-500">লোড হচ্ছে...</span>
  ) : session?.user ? (
    <>
      <span className="max-w-36 truncate text-sm font-semibold text-green-800">
        👤 {session.user.name || session.user.email}
      </span>


  <button
    onClick={async () => {
      const result = await authClient.signOut();

      if (!result.error) {
        window.location.reload();
      }
    }}
    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
  >
    সাইন আউট
  </button>
</>


) : (
<> <Link
     href="/signin"
     className="rounded-lg border border-green-700 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
   >
সাইন ইন </Link>


  <Link
    href="/signup"
    className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"
  >
    সাইন আপ
  </Link>
</>


)}

</div>

        </div>

        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={
                category.slug === "all"
                  ? "/"
                  : `/category/${category.slug}`
              }
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === category.slug
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-800"
              }`}
              onClick={() => setActiveCategory(category.slug)}
            >
              {category.icon} {category.name}
            </Link>
          ))}
        </nav>
      </header>

      {/* Price ticker */}
      <div className="overflow-hidden border-b border-green-100 bg-green-50 py-3">
        <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap">
          {[...products, ...products].map((product, index) => {
            const change = getChange(product);

            return (
              <span key={`${product.id}-${index}`} className="text-sm">
                {getEmoji(product)}{" "}
                <strong>{getName(product)}</strong>{" "}
                <span className="font-bold text-green-800">
                  {formatPrice(product.today)} টাকা
                </span>{" "}
                <span
                  className={
                    change.className.includes("green")
                      ? "text-green-700"
                      : change.className.includes("red")
                        ? "text-red-600"
                        : "text-gray-500"
                  }
                >
                  {change.text}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:py-20 md:grid-cols-2">
        <div>
          <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800">
            🌿 বাংলাদেশের নিত্যপণ্যের বাজারদর
          </span>

          <h1 className="mt-6 text-4xl font-black leading-tight text-gray-900 sm:text-5xl">
            প্রতিদিনের বাজার,
            <span className="block text-green-700">
              দাম জানুন এক নজরে।
            </span>
          </h1>

          <p className="mt-5 max-w-lg leading-8 text-gray-600">
            চাল, ডাল, তেল, মাছ, মাংস ও নিত্যপ্রয়োজনীয় পণ্যের
            আজকের দাম এবং দামের পরিবর্তন সহজেই দেখুন।
          </p>

          <a
            href="#সব-পণ্য"
            className="mt-7 inline-flex rounded-xl bg-green-700 px-6 py-3 font-bold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800"
          >
            সব পণ্যের দাম দেখুন ↓
          </a>
        </div>

        <div className="flex min-h-64 items-center justify-center rounded-3xl border border-green-100 bg-gradient-to-br from-green-100 via-white to-yellow-50 p-8">
          <div className="grid grid-cols-3 gap-4 text-5xl sm:text-6xl">
            <span>🍚</span>
            <span>🫘</span>
            <span>🫙</span>
            <span>🥔</span>
            <span>🧅</span>
            <span>🐟</span>
            <span>🥚</span>
            <span>🍗</span>
            <span>🥦</span>
          </div>
        </div>
      </section>

      {/* Price increases */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-gray-900">
            আজ দাম বেড়েছে <span className="text-green-700">▲</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            যেসব পণ্যের দাম আজ বেড়েছে
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : risers.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {risers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-white p-5 text-gray-500">
            বর্তমানে দাম বৃদ্ধির তথ্য পাওয়া যায়নি।
          </p>
        )}
      </section>

      {/* Price decreases */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-gray-900">
            আজ দাম কমেছে <span className="text-red-600">▼</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            যেসব পণ্যের দাম আজ কমেছে
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : fallers.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {fallers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-white p-5 text-gray-500">
            বর্তমানে দাম কমার তথ্য পাওয়া যায়নি।
          </p>
        )}
      </section>

      {/* All products */}
      <section id="সব-পণ্য" className="mx-auto max-w-6xl scroll-mt-36 px-4 py-12">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              সব পণ্য
            </h2>
            <p className="mt-2 text-gray-500">
              নিত্যপ্রয়োজনীয় পণ্যের আজকের বাজারদর
            </p>
          </div>

          <p className="text-sm text-gray-500">
            মোট পণ্য:{" "}
            <strong className="text-green-800">
              {filteredProducts.length.toLocaleString("bn-BD")}
            </strong>
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="পণ্যের নাম লিখে খুঁজুন..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setActiveCategory(category.slug)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === category.slug
                    ? "bg-green-700 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-green-300"
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-bold text-red-700">{error}</p>
            <p className="mt-2 text-sm text-gray-600">
              ইন্টারনেট সংযোগ এবং API ঠিক আছে কি না পরীক্ষা করো।
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <span className="text-5xl">🔎</span>
            <h3 className="mt-4 text-xl font-bold">কোনো পণ্য পাওয়া যায়নি</h3>
            <p className="mt-2 text-gray-500">
              অন্য নাম দিয়ে খুঁজে দেখো অথবা ক্যাটাগরি পরিবর্তন করো।
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800"
            >
              সব পণ্য দেখুন
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p className="font-bold text-green-800">
            বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
          </p>
          <p>
            সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
          </p>
        </div>
      </footer>
    </main>
  );
}