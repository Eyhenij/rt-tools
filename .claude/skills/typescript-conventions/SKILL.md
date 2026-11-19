---
name: typescript-conventions
kind: rule
law: code-structure
description: Rule under the code-structure law. Load when editing any .ts except a component, service, directive, pipe, guard or interceptor — strict typing, access modifiers, file names, prefixes, no casting in a mapper. Pattern ts-procedure.
---
<!-- rt-kit v0.37.0 · rules/typescript-conventions.md · ab16be999a45 · правится надстройкой, не здесь -->

# Code structure — how it works here

Rule under the law `docs/constitution/code-structure.md`. Cold part: `pitfalls.md` — the whole text,
every section and article with its reasons.

## How the law applies here

- **The kind of a declaration shows in the name prefix, and three linter rules hold that.**
  <!-- rt-when: *.ts -->
- **A watched source is named by a suffix.**
  <!-- rt-when: *.ts -->
- **A file name suffix promises a declaration of that kind inside.**
  <!-- rt-when: *.ts -->
- **A file is no longer than 500 lines, and all lines count — blank ones and comments too.**
  <!-- rt-when: *.ts -->
- **A value from a closed set arrives as an enum `E<Name>`, not as a string or a number at the place
  of use.**
  <!-- rt-when: *.ts -->
- **A set that must be complete is declared as a full record over the key type, not a partial one.**
  <!-- rt-when: *.ts -->
- **A type is taken from the package where it is declared.**
  <!-- rt-when: *.ts -->
- **A value declared by one side of an exchange is not recomputed by the other side but taken from
  the first.**
  <!-- rt-when: *.ts -->
- **The two-step cast `as unknown as` is forbidden by a linter rule.**
  <!-- rt-when: *.ts -->
- **A deprecation mark is set together with a walk over the consumers.**
  <!-- rt-when: *.ts -->

## Pitfalls

- **Function complexity limits are asked from the plugin, not recalled.**
- **A decision is moved into a pure function of the util layer before the handler is written.**
- **A file an edit pushed past the 500-line limit is split, not squeezed.**

## Names and techniques

- Prefix `I` on an interface, `E` on an enum, `T` on a type.
- Suffix `$` on an observable, `Source` on a subject.
- A private field is `#field`, not `private field`; `protected` where `viewChild` needs it.
- An enum lives in the owner domain's `util`; a value with no closed set is a file constant.
- Completeness of values is held by a test over the whole set, in the same change.
- Use an honest type, narrowing or `Reflect.get`; else a spot disable with its reason.
- On `libs/api`, `apps/api` no signals or `inject`: NestJS constructor DI.
- No `as Type` in a mapper; use `this.typeCast`.
- Remove an unused parameter; do not hide it behind an underscore.
- Do not annotate a Prisma aggregate with a type of your own.
- Enable a linter rule of your own together with fixing all it catches.

## Patterns

- `ts-procedure` — a Connect procedure on the backend.
