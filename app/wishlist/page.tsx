import { WishlistPageClient } from "@/components/WishlistPageClient";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Wishlist", "View your saved favorite murtis.", "/wishlist");

export default function WishlistPage() {
  return <WishlistPageClient />;
}
