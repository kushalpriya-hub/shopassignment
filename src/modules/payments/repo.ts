import { table } from "../../platform/db.ts";
export interface ChargeRow { id: string; orderId: string; amountPaise: number }
export const charges = () => table<ChargeRow>("charges");
