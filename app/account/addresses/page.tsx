import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Saved Addresses", "Manage saved delivery addresses.", "/account/addresses");

export default async function AddressesPage() {
  if (!(await auth())?.user) redirect("/login?callbackUrl=/account/addresses");
  return (
    <main className="premium-container py-16 md:py-24">
      <p className="section-kicker">Account</p>
      <h1 className="mt-3 text-5xl text-primary md:text-6xl">Saved Addresses</h1>
      <div className="mt-10 rounded-3xl bg-surface-container p-8">
        <h2 className="text-3xl text-primary">No saved addresses yet</h2>
        <p className="mt-3 text-on-surface-variant">Address persistence will be connected to your secure customer profile.</p>
        <Link href="/account/addresses/edit" className="btn btn-primary mt-6 rounded-xl">Add Address</Link>
      </div>
    </main>
  );
}
