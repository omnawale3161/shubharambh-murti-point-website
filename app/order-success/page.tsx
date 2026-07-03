import { notFound } from "next/navigation";
import { SuccessCelebration } from "@/components/orders/SuccessCelebration";
import { OrderDetailsView } from "@/components/orders/OrderDetailsView";
import { getOrderPersistenceConfig, getPublicOrder } from "@/lib/payments";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Order Successful", "Your order has been placed.", "/order-success");

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ id?: string; token?: string }> }) {
  const { id, token } = await searchParams;
  if (!id || !token) notFound();
  const order = await getPublicOrder(id, token, getOrderPersistenceConfig());
  if (!order) notFound();
  return <main className="premium-container py-10 md:py-16"><section className="mb-10 text-center"><SuccessCelebration /><p className="section-kicker mt-5">Order Placed</p><h1 className="mt-2 text-4xl text-primary md:text-6xl">Thank you for your order</h1><p className="mx-auto mt-3 max-w-2xl text-on-surface-variant">Your confirmation is ready. We will keep you updated as your order moves toward delivery.</p></section><OrderDetailsView order={order} token={token} success /></main>;
}

