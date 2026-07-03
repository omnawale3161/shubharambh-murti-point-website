import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Add Address", "Add a delivery address.", "/account/addresses/edit");

export default async function EditAddressPage() {
  if (!(await auth())?.user) redirect("/login?callbackUrl=/account/addresses/edit");
  return (
    <main className="premium-container py-16 md:py-24">
      <p className="section-kicker">Account</p>
      <h1 className="mt-3 text-5xl text-primary">Add Delivery Address</h1>
      <form className="premium-card mt-10 grid max-w-3xl gap-5 rounded-3xl p-8 md:grid-cols-2">
        {["Full name", "Phone number", "Address line", "City", "State", "Pincode"].map((label) => <label key={label} className="grid gap-2 text-sm font-bold">{label}<input className="rounded-2xl border border-outline-variant bg-surface-container-low px-5 py-4 outline-hidden focus:border-gold" /></label>)}
        <button type="button" className="btn btn-primary rounded-xl md:col-span-2">Save Address</button>
      </form>
    </main>
  );
}
