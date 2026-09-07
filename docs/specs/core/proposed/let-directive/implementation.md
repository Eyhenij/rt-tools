# The binding — a local value of a template

- **The directive declares a name and does not dispose of the showing** — `let.directive.ts:constructor`
- **The view is created once, and a new value arrives into it** — `let.directive.ts:constructor`
- **The name is available both as the value by default and under the name of the directive** — `let.directive.ts:IRtLetContext`
- **The type of the value reaches the content** — `let.directive.ts:ngTemplateContextGuard`
- **The content is redrawn together with the host, and the directive puts no mark of its own** — `let.directive.ts:constructor`

The paths are from the root of the package: `projects/core/src/lib/directives/`.

- **Scenario** — Test
- **`SC-CR-01`** — `let.directive.spec.ts`
- **`SC-CR-02`** — `let.directive.spec.ts`
- **`SC-CR-03`** — `let.directive.spec.ts`
- **`SC-CR-04`** — `let.directive.spec.ts`
