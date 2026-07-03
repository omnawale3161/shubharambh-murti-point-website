"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/backend/auth";
import { formDataRecord, parseCategory, parseContactStatus, parseProduct } from "@/lib/backend/validation";
import { EnvironmentConfigurationError } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrderPersistenceConfig, updateOrderStatus, type OrderStatus } from "@/lib/payments";

export type ActionState = { error?: string; success?: string };

function fail(message: string): ActionState {
  return { error: message };
}

export async function adminLoginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || password.length < 8) return fail("Enter a valid email and password.");

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return fail("Invalid email or password.");

    const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    if (profileError || profile?.role !== "admin") {
      await supabase.auth.signOut();
      return fail("This account does not have administrator access.");
    }
  } catch (error) {
    return fail(error instanceof EnvironmentConfigurationError ? "Supabase Auth is not configured. Add the required environment variables." : "Admin sign in is temporarily unavailable.");
  }
  redirect("/admin");
}

export async function adminLogoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveProductAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const input = parseProduct(formDataRecord(formData));
  if (!input) return fail("Check the product name, slug, prices, and stock count.");

  let result;
  if (id) {
    const stock = input.stock ?? 0;
    const productFields = { ...input };
    delete productFields.stock;
    delete productFields.stock_count;
    result = await supabase.from("products").update(productFields).eq("id", id);
    if (!result.error) {
      const adjustment = await supabase.rpc("admin_adjust_stock", { target_product_id: id, new_stock: stock, adjustment_note: "Product editor stock update" });
      if (adjustment.error) return fail(adjustment.error.message);
    }
  } else {
    result = await supabase.from("products").insert(input);
  }
  if (result.error) return fail(result.error.message);

  revalidatePath("/admin/products");
  revalidatePath("/collections");
  return { success: id ? "Product updated." : "Product created." };
}

export async function deleteProductAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
}

export async function saveCategoryAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const input = parseCategory(formDataRecord(formData));
  if (!input) return fail("Check the category name, slug, and sort order.");
  const result = id
    ? await supabase.from("categories").update(input).eq("id", id)
    : await supabase.from("categories").insert(input);
  if (result.error) return fail(result.error.message);
  revalidatePath("/admin/categories");
  return { success: id ? "Category updated." : "Category created." };
}

export async function deleteCategoryAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

export async function updateContactStatusAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = parseContactStatus(formData.get("status"));
  if (id && status) await supabase.from("contact_submissions").update({ status }).eq("id", id);
  revalidatePath("/admin/contacts");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as OrderStatus;
  const trackingNumber = String(formData.get("trackingNumber") || "").trim().slice(0, 100);
  const allowed: OrderStatus[] = ["created", "cod_pending", "payment_authorized", "paid", "confirmed", "packed", "shipped", "delivered", "cancelled", "payment_failed"];
  if (id && allowed.includes(status)) {
    await updateOrderStatus({ id, status, trackingNumber, credentials: getOrderPersistenceConfig() });
  }
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updateStockAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const stock = Number(formData.get("stock"));
  const note = String(formData.get("note") || "Admin stock update").trim().slice(0, 300);
  if (id && Number.isInteger(stock) && stock >= 0) {
    const { error } = await supabase.rpc("admin_adjust_stock", { target_product_id: id, new_stock: stock, adjustment_note: note });
    if (error) throw error;
  }
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}

export async function bulkUpdateStockAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const updates = [...formData.entries()].flatMap(([key, value]) => {
    if (!key.startsWith("stock_")) return [];
    const stock = Number(value);
    return Number.isInteger(stock) && stock >= 0 ? [{ id: key.slice(6), stock }] : [];
  });
  const results = await Promise.all(updates.map(({ id, stock }) =>
    supabase.rpc("admin_adjust_stock", { target_product_id: id, new_stock: stock, adjustment_note: "Bulk inventory update" })
  ));
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}

export async function uploadProductImageAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choose an image to upload.");
  if (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
    return fail("Use a JPG, PNG, WebP, or AVIF image up to 5 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return fail(error.message);
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { success: `${data.publicUrl}|${path}` };
}
