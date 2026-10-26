import { table } from "../../platform/db.ts";

export interface Order {
  id: string;
  sku: string;
  qty: number;
  amountPaise: number;
  chargeId: string;
}

export const orders = () => table<Order>("orders");
