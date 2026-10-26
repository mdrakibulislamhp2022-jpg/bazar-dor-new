import { Suspense } from "react";
import CategoryContent from "./CategoryContent";

export default function CategoryPage() {
  return (
    <Suspense fallback={<p className="p-6">লোড হচ্ছে...</p>}>
      <CategoryContent />
    </Suspense>
  );
}