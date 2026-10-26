// This passes today. It must still pass when you are finished.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { reset } from "../src/platform/db.ts";
import { seed } from "../src/modules/inventory/repo.ts";
import { placeOrder, get } from "../src/modules/orders/index.ts";
import { onHand } from "../src/modules/inventory/index.ts";
import { sent } from "../src/modules/notifications/index.ts";

beforeEach(() => { reset(); seed(); });

test("a good order reserves stock, charges, and is retrievable", () => {
  const r = placeOrder({ sku: "sku-1", qty: 2, unitPaise: 45000, email: "a@example.com" });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.amountPaise, 90000);
  assert.equal(onHand("sku-1"), 3);
  assert.equal(get(r.orderId)?.sku, "sku-1");
});

test("an out of stock order changes nothing", () => {
  const r = placeOrder({ sku: "sku-2", qty: 1, unitPaise: 45000, email: "a@example.com" });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.equal(r.reason, "out_of_stock");
});

test("a confirmation goes out for a good order", () => {
  placeOrder({ sku: "sku-1", qty: 1, unitPaise: 45000, email: "a@example.com" });
  assert.equal(sent().length, 1);
});

test("no confirmation for a failed order", () => {
  placeOrder({ sku: "sku-2", qty: 1, unitPaise: 45000, email: "a@example.com" });
  assert.equal(sent().length, 0);
});
