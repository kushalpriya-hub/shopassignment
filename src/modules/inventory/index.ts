// The public API of the inventory module.
// Task 2: everything another module needs goes through here, and nothing else.
export { reserve, onHand } from "./service.ts";
export type { ReserveResult } from "./service.ts";
