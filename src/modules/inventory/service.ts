import { stock } from "./repo.ts";

export type ReserveResult =
  | { ok: true; remaining: number }
  | { ok: false; reason: "unknown_sku" | "out_of_stock" };

export function reserve(sku: string, qty: number): ReserveResult {
  const row = stock().get(sku);
  if (!row) return { ok: false, reason: "unknown_sku" };
  if (row.onHand < qty) return { ok: false, reason: "out_of_stock" };
  row.onHand -= qty;
  return { ok: true, remaining: row.onHand };
}

export function onHand(sku: string): number {
  return stock().get(sku)?.onHand ?? 0;
}
