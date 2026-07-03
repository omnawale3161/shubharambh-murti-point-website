import { CartPageClient } from "@/components/CartPageClient";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Cart", "Review your selected murtis.", "/cart");

export default function CartPage() {
  return <CartPageClient />;
}
