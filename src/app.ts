import { seed } from "./modules/inventory/repo.ts";
import { placeOrder } from "./modules/orders/index.ts";
import { sent } from "./modules/notifications/index.ts";

seed();
console.log(placeOrder({ sku: "sku-1", qty: 2, unitPaise: 45000, email: "a@example.com" }));
console.log(placeOrder({ sku: "sku-2", qty: 1, unitPaise: 45000, email: "a@example.com" }));
console.log("notifications sent:", sent().length);
