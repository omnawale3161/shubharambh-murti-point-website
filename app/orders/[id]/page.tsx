import { notFound } from "next/navigation";
import { OrderDetailsView } from "@/components/orders/OrderDetailsView";
import { getOrderPersistenceConfig, getPublicOrder } from "@/lib/payments";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Track Order", "Track your order delivery status.", "/orders");

export default async function PublicOrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ token?: string }> }) {
  const [{ id }, { token }] = await Promise.all([params, searchParams]);
  if (!token) notFound();
  const order = await getPublicOrder(id, token, getOrderPersistenceConfig());
  if (!order) notFound();
  return <main className="premium-container py-12 md:py-20"><p className="section-kicker">Order Tracking</p><h1 className="mt-2 text-4xl text-primary md:text-5xl">Track your order</h1><div className="mt-8"><OrderDetailsView order={order} token={token} /></div></main>;
}

