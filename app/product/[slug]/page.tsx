import { Suspense } from "react";
import ProductDetails from "./ProductDetails";

export default function ProductPage() {
  return (
    <Suspense fallback={<p className="p-6">পণ্যের তথ্য লোড হচ্ছে...</p>}>
      <ProductDetails />
    </Suspense>
  );
}