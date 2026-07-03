import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountPanel } from "@/components/AccountPanel";
import { getCustomerById, getCustomerOrders } from "@/lib/auth";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("My Account", "Manage your customer account and secure orders.", "/account");

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const customer = await getCustomerById(session.user.id);
  if (!customer) redirect("/login");

  const orders = await getCustomerOrders(customer.id);

  return (
    <main className="premium-container py-14">
      <p className="section-kicker">My Account</p>
      <h1 className="mt-3 max-w-3xl text-5xl font-black leading-tight">Customer account dashboard.</h1>
      <div className="mt-10">
        <AccountPanel customer={customer} orders={orders} />
      </div>
    </main>
  );
}
