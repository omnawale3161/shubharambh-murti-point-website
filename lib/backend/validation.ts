import type { ContactStatus, Database } from "@/lib/supabase/database.types";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type ContactInsert = Database["public"]["Tables"]["contact_submissions"]["Insert"];
type ProductMutation = Omit<ProductInsert, "id" | "created_at" | "updated_at">;
type CategoryMutation = Omit<CategoryInsert, "id" | "created_at" | "updated_at">;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

function nullableText(value: unknown, max: number) {
  return text(value, max) || null;
}

function integer(value: unknown, minimum = 0) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum ? parsed : null;
}

function boolean(value: unknown) {
  return value === true || value === "true" || value === "on";
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function parseProduct(value: Record<string, unknown>): ProductMutation | null {
  const name = text(value.name, 160);
  const slug = slugify(text(value.slug, 180) || name);
  const sku = text(value.sku, 100).toLowerCase();
  const pricePaise = integer(value.price_paise);
  const stock = integer(value.stock ?? value.stock_count);
  const lowStockThreshold = integer(value.low_stock_threshold ?? 5);
  const compareAt = value.compare_at_price_paise ? integer(value.compare_at_price_paise) : null;
  if (name.length < 2 || !slug || !/^[a-z0-9][a-z0-9-]{2,99}$/.test(sku) || pricePaise === null || stock === null || lowStockThreshold === null || (compareAt !== null && compareAt < pricePaise)) return null;

  return {
    name,
    slug,
    category_id: nullableText(value.category_id, 64),
    description: text(value.description, 4000),
    price_paise: pricePaise,
    compare_at_price_paise: compareAt,
    stock_count: stock,
    stock,
    low_stock_threshold: lowStockThreshold,
    sku,
    image_url: nullableText(value.image_url, 1000),
    image_path: nullableText(value.image_path, 500),
    material: text(value.material, 120),
    size: text(value.size, 120),
    badge: nullableText(value.badge, 80),
    is_active: boolean(value.is_active),
    is_featured: boolean(value.is_featured)
  };
}

export function parseCategory(value: Record<string, unknown>): CategoryMutation | null {
  const name = text(value.name, 100);
  const slug = slugify(text(value.slug, 120) || name);
  const sortOrder = integer(value.sort_order);
  return name.length >= 2 && slug && sortOrder !== null
    ? { name, slug, description: text(value.description, 1000), sort_order: sortOrder, is_active: boolean(value.is_active) }
    : null;
}

export function parseContact(value: Record<string, unknown>): ContactInsert | null {
  const name = text(value.name, 80);
  const email = nullableText(value.email, 254);
  const phone = text(value.phone, 20);
  const message = text(value.message, 2000);
  const validEmail = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return name.length >= 2 && /^[+0-9][0-9\s-]{9,19}$/.test(phone) && message.length >= 10 && validEmail
    ? { name, email, phone, message, status: "new" }
    : null;
}

export function parseContactStatus(value: unknown): ContactStatus | null {
  return ["new", "in_progress", "resolved", "spam"].includes(String(value)) ? value as ContactStatus : null;
}

export function formDataRecord(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
