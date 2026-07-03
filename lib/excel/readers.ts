import "server-only";
import path from "node:path";
import { readSheet } from "read-excel-file/node";
import type { DecorItem, Frame, Idol } from "./types";

type Row = Record<string, unknown>;

async function rows(fileName: string) {
  const [headers, ...values] = await readSheet(path.join(process.cwd(), "data", fileName));
  return values.map((row) => Object.fromEntries(headers.map((header, index) => [String(header), row[index]])));
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function base(row: Row) {
  return {
    id: text(row.id),
    slug: text(row.slug),
    name: text(row.name),
    price: Number(row.price) || 0,
    badge: row.badge ? text(row.badge) as Idol["badge"] : undefined,
    description: text(row.description),
    image: text(row.image),
    inStock: row.inStock === true || row.inStock === "TRUE" || row.inStock === 1,
    stockCount: Number(row.stockCount) || 0,
    occasion: row.occasion ? text(row.occasion).split(",").map((item) => item.trim()).filter(Boolean) : []
  };
}

export async function readIdols(): Promise<Idol[]> {
  return (await rows("idols.xlsx")).map((row) => ({
    ...base(row),
    collection: text(row.collection),
    size: text(row.size),
    material: text(row.material),
    weight: row.weight ? text(row.weight) : undefined
  }));
}

export async function readFrames(): Promise<Frame[]> {
  return (await rows("frames.xlsx")).map((row) => ({
    ...base(row),
    frameType: text(row.frameType),
    dimensions: text(row.dimensions),
    material: text(row.material),
    photoSlots: Number(row.photoSlots) || 1
  }));
}

export async function readDecor(): Promise<DecorItem[]> {
  return (await rows("decor.xlsx")).map((row) => ({
    ...base(row),
    category: text(row.category),
    dimensions: row.dimensions ? text(row.dimensions) : undefined,
    material: text(row.material)
  }));
}
