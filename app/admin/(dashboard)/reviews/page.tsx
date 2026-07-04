import { Check, MessageSquareReply, Star, Trash2, X } from "lucide-react";
import { deleteReviewAction, updateReviewApprovalAction } from "@/app/admin/actions";
import { AdminCard, AdminEmptyState, AdminPageHeader, AdminStatusBadge } from "@/components/admin/AdminUI";
import { requireAdmin } from "@/lib/backend/auth";

export default async function AdminReviewsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: reviews, error }, { data: products }] = await Promise.all([
    supabase.from("product_reviews").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("products").select("id,name")
  ]);
  const productNames = new Map((products || []).map((product) => [product.id, product.name]));

  return (
    <>
      <AdminPageHeader kicker="Reputation" title="Reviews" description="Approve, reject, delete, and monitor product reviews from real customer submissions." />
      {error ? (
        <div className="mt-8"><AdminEmptyState title="Reviews table is unavailable" description={`Supabase returned: ${error.message}. Apply the reviews migration before using moderation.`} /></div>
      ) : (
        <div className="mt-8 grid gap-4">
          {reviews?.length ? reviews.map((review) => (
            <AdminCard key={review.id}>
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black text-slate-950">{review.name}</h2>
                    <AdminStatusBadge tone={review.is_approved ? "green" : "amber"}>{review.is_approved ? "Approved" : "Pending"}</AdminStatusBadge>
                  </div>
                  <p className="mt-2 text-sm font-bold text-amber-600">{"★".repeat(review.rating)}<span className="ml-2 text-slate-500">{review.city}</span></p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{productNames.get(review.product_id) || "Product"} · {new Date(review.created_at).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={updateReviewApprovalAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="approved" value="true" />
                    <button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700"><Check size={16} />Approve</button>
                  </form>
                  <form action={updateReviewApprovalAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="approved" value="false" />
                    <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 transition hover:border-amber-300 hover:text-amber-700"><X size={16} />Reject</button>
                  </form>
                  <button disabled title="Reply storage is not configured in the current reviews table." className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-400"><MessageSquareReply size={16} />Reply</button>
                  <form action={deleteReviewAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-black text-red-700 transition hover:bg-red-50"><Trash2 size={16} />Delete</button>
                  </form>
                </div>
              </div>
              <blockquote className="mt-5 rounded-2xl bg-slate-50 p-4 leading-7 text-slate-700">&quot;{review.quote}&quot;</blockquote>
            </AdminCard>
          )) : <AdminEmptyState title="No reviews yet" description="Submitted customer reviews will appear here for moderation." />}
        </div>
      )}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
        <Star size={17} className="mr-2 inline" />Replies need a dedicated reply column or table. I left schema unchanged as requested.
      </div>
    </>
  );
}
