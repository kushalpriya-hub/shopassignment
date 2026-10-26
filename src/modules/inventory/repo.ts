import { table } from "../../platform/db.ts";

export interface StockRow { sku: string; onHand: number }

export const stock = () => table<StockRow>("stock");

export function seed(): void {
  stock().set("sku-1", { sku: "sku-1", onHand: 5 });
  stock().set("sku-2", { sku: "sku-2", onHand: 0 });
}
