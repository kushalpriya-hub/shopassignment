import { test } from "node:test";
import assert from "node:assert/strict";
import { createEventBus } from "../src/platform/event-bus.ts";

const payload = { orderId: "ord_1", email: "a@example.com", amountPaise: 100 };

test("a published event reaches its subscribers", () => {
  const bus = createEventBus();
  const seen: string[] = [];
  bus.subscribe("order.placed", (p) => seen.push(p.orderId));
  assert.equal(bus.publish("order.placed", payload), 1);
  assert.deepEqual(seen, ["ord_1"]);
});

test("nobody listening is fine", () => {
  assert.equal(createEventBus().publish("order.placed", payload), 0);
});

test("one handler throwing does not stop the others", () => {
  const bus = createEventBus();
  const seen: string[] = [];
  bus.subscribe("order.placed", () => { throw new Error("boom"); });
  bus.subscribe("order.placed", () => seen.push("second"));
  assert.equal(bus.publish("order.placed", payload), 2);
  assert.deepEqual(seen, ["second"]);
});

test("unsubscribe stops delivery", () => {
  const bus = createEventBus();
  let n = 0;
  const off = bus.subscribe("order.placed", () => { n += 1; });
  bus.publish("order.placed", payload);
  off();
  bus.publish("order.placed", payload);
  assert.equal(n, 1);
});

test.todo("orders publishes order.placed, and notifications subscribes to it");
