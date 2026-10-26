import { table } from "../../platform/db.ts";
export interface Message { id: string; to: string; subject: string }
export const outbox = () => table<Message>("outbox");
