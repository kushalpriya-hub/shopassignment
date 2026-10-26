import { outbox, type Message } from "./repo.ts";

let n = 0;

export function send(to: string, subject: string): string {
  const id = `msg_${++n}`;
  outbox().set(id, { id, to, subject });
  return id;
}

export function sent(): Message[] {
  return [...outbox().values()];
}
