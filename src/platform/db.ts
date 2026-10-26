/** A tiny in-memory store. Do not change this file. */
const tables = new Map<string, Map<string, unknown>>();

export function table<T>(name: string): Map<string, T> {
  if (!tables.has(name)) tables.set(name, new Map());
  return tables.get(name) as Map<string, T>;
}

export function reset(): void {
  tables.clear();
}
