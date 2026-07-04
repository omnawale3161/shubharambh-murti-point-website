import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Saved Addresses", "Manage saved delivery addresses.", "/account/addresses");

export default async function AddressesPage() {
  if (!(await auth())?.user) redirect("/login?callbackUrl=/account/addresses");
  return (
    <main className="premium-container py-10 md:py-24">
      <p className="section-kicker">Account</p>
      <h1 className="mt-3 text-4xl text-primary md:text-6xl">Saved Addresses</h1>
      <div className="mt-7 rounded-3xl bg-surface-container p-5 shadow-card md:mt-10 md:p-8">
        <h2 className="text-2xl text-primary md:text-3xl">No saved addresses yet</h2>
        <p className="mt-3 text-on-surface-variant">Address persistence will be connected to your secure customer profile.</p>
        <Link href="/account/addresses/edit" className="btn btn-primary mt-6 w-full rounded-xl sm:w-fit">Add Address</Link>
      </div>
    </main>
  );
}
