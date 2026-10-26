import { charges } from "./repo.ts";

export type ChargeResult =
  | { ok: true; chargeId: string }
  | { ok: false; reason: "bad_amount" };

let n = 0;

export function charge(orderId: string, amountPaise: number): ChargeResult {
  if (amountPaise <= 0) return { ok: false, reason: "bad_amount" };
  const id = `ch_${++n}`;
  charges().set(id, { id, orderId, amountPaise });
  return { ok: true, chargeId: id };
}
