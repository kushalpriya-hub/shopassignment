# The day task — make the boundaries real

A working four-module shop. It does what it should; it just breaks every
rule from Part 3 of the deck while doing it.

TypeScript, and no dependencies. Node 22.18 or later runs `.ts` files
directly, so there is nothing to install and nothing to build.

```
node src/app.ts     # see it work
node --test         # boundaries + event-bus fail, flow passes
```

Type-checking is optional and is the only thing that wants an install:

```
npm i -D typescript @types/node
npx tsc --noEmit
```

| File | State now |
|---|---|
| `test/flow.test.ts` | **green** — keep it green, behaviour must not change |
| `test/boundaries.test.ts` | red — you write the checker, then fix what it finds |
| `test/event-bus.test.ts` | red — you finish the bus |

The violations are all in `src/modules/orders/service.ts` and each is
marked with a comment. Delete the comments as you fix them.

One thing TypeScript makes easier to get wrong: a `import type { ... }`
across a module boundary still couples the two modules. Your checker
should catch those too, and one test checks that it does.

Write your extraction plan in `EXTRACTION-PLAN.md`.
