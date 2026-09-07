---
name: ts-procedure
kind: pattern
rule: typescript-conventions
description: Pattern of rule typescript-conventions. Load when creating or editing a Connect procedure on the backend — the ready-made class with the method field and the handler, dependencies through the constructor, file and class names. Access to a procedure is described by the access rule of the tree.
---

# A Connect procedure

Pattern of the rule `typescript-conventions`. What must be true — the law
`docs/constitution/code-structure.md`.

## When to use

- A new backend procedure is created.
- The body of an existing one is edited.
- A domain moves onto the vertical cut.

## One procedure — one class

The file `<procedure>.procedure.ts` in the `feature` layer of its domain, the class
`<Procedure>Procedure`, a public field `method` with the descriptor from the contract and a
public method `handle` with the body. Dependencies come through the constructor — on the backend
the DI is NestJS's, there is no `inject()` there.

```typescript
@Injectable()
@ConnectProcedure()
@RequiresPermission('bookings:manage')
export class PingProcedure implements IConnectProcedure<typeof HealthService.method.ping> {
    readonly #health: HealthCheckService;

    public readonly method: typeof HealthService.method.ping = HealthService.method.ping;

    constructor(health: HealthCheckService) {
        this.#health = health;
    }

    public async handle(): Promise<{ status: EHealthStatus }> {
        return { status: (await this.#health.check()).status };
    }
}
```

The access declaration is mandatory, and there is exactly one; what declares it is said by the
access rule of the tree that has such a rule.

## Why this shape

The previous one — `register(router)` with bodies in closures inside `router.service(...)` — made
the handler unreachable for a test: only a class with a `register` method stuck out. And
`router.service` stubs every method not passed with an `Unimplemented` answer, so one proto
service could not be served by two domains.

The class solves both: `handle` is called by the test directly, and the registry puts the
procedures in one by one through `router.rpc`.

## Common misses

- A third suffix: `*.rpc.ts` and `*.connect.ts` are the previous names, they leave together with
  the last domain moved, and no new such files are created.
- `inject()` in a procedure class: on the backend dependencies go through the constructor.
- The body in a closure inside the router registration: a test cannot reach it.
- A procedure without an access declaration: the application does not start.
- An `as` cast in model translation: on the backend it is forbidden the same as in a frontend
  mapper.
- An own type for the result of Prisma's `groupBy`: it is conditional, assembled from the call
  arguments, and does not match one written out by hand. Where the keys are few, a `count` per
  key goes in `Promise.all`.
