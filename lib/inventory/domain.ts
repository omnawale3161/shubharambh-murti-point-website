import type { PersistedOrder } from "@/lib/payments";
import type { ProductRecord } from "@/lib/supabase/database.types";

export type InventoryAvailability = {
  stock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
};

export function inventoryAvailability(product: Pick<ProductRecord, "stock" | "reserved_stock" | "low_stock_threshold">): InventoryAvailability {
  const availableStock = Math.max(0, product.stock - product.reserved_stock);
  return {
    stock: product.stock,
    reservedStock: product.reserved_stock,
    availableStock,
    lowStockThreshold: product.low_stock_threshold,
    isLowStock: availableStock > 0 && availableStock <= product.low_stock_threshold,
    isOutOfStock: availableStock === 0
  };
}

export function salesReport(orders: PersistedOrder[]) {
  const completed = orders.filter((order) => ["paid", "confirmed", "packed", "shipped", "delivered"].includes(order.status));
  const productSales = new Map<string, { name: string; quantity: number; revenuePaise: number }>();
  const dailyRevenue = new Map<string, number>();
  const monthlyRevenue = new Map<string, number>();

  completed.forEach((order) => {
    const date = (order.created_at || "").slice(0, 10);
    const month = date.slice(0, 7);
    if (date) dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + order.amount_paise);
    if (month) monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + order.amount_paise);
    (order.order_items || []).forEach((item) => {
      const current = productSales.get(item.productId) || { name: item.productName, quantity: 0, revenuePaise: 0 };
      current.quantity += item.quantity;
      current.revenuePaise += item.unitPricePaise * item.quantity;
      productSales.set(item.productId, current);
    });
  });

  return {
    bestSellers: [...productSales.values()].sort((a, b) => b.quantity - a.quantity),
    dailyRevenue: [...dailyRevenue.entries()].sort(([a], [b]) => b.localeCompare(a)),
    monthlyRevenue: [...monthlyRevenue.entries()].sort(([a], [b]) => b.localeCompare(a))
  };
}
