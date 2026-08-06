---
name: rt-tools-testing
description: Write or run unit tests in either kit — Jest (not Vitest) with jest-preset-angular, a zoneless TestBed, setInput-driven fixtures and DOM-class assertions, plus the ui-kit-v2 harness and its coverage contract. Use when creating or editing any *.spec.ts, adding coverage for a component/service/pipe, or running a single test file.
---

# Testing

Jest + `jest-preset-angular`, one project per package, specs co-located with the
source as `*.spec.ts`.

Reference specs:

- component — `projects/ui-kit/src/lib/ui-kit/buttons/unified-button/rtui-button.component.spec.ts`
- service/store — `projects/store/src/lib/base-store.service.spec.ts`
- pure function/pipe — `projects/utils/src/lib/functions/sorters.spec.ts`

## Golden rule

The TestBed is **zoneless**. `projects/ui-kit/src/test-setup.ts` runs
`setupZonelessTestEnv({ errorOnUnknownElements: true, errorOnUnknownProperties: true })`
— a missing import in the component under test fails the spec instead of silently
rendering nothing. Drive change detection explicitly with `fixture.detectChanges()`.

## Commands

```bash
pnpm test                                                        # nx run-many -t test
pnpm exec nx test @rt-tools/ui-kit                               # one package
pnpm exec nx test @rt-tools/ui-kit --testFile=<relative-path>    # one file
```

`passWithNoTests` is on, so an empty run is green — never take a passing target as
proof your spec ran; check the reported test count.

## Component spec shape

A local `setup()` helper that configures the TestBed, seeds inputs via
`componentRef.setInput`, and returns the fixture; small query helpers on top:

```typescript
function setup(config?: IRtUiConfig.Config): ComponentFixture<RtuiButtonComponent> {
    TestBed.configureTestingModule({
        imports: [RtuiButtonComponent],
        providers: [{ provide: RT_UI_CONFIG, useValue: config ?? {} }],
    });

    const fixture: ComponentFixture<RtuiButtonComponent> = TestBed.createComponent(RtuiButtonComponent);
    fixture.componentRef.setInput('type', 'pill');
    fixture.detectChanges();

    return fixture;
}

it('defaults to the custom design, md size and full radius without any config', () => {
    const fixture: ComponentFixture<RtuiButtonComponent> = setup();

    expect(buttonClasses(fixture).contains('rtui-button--design-custom')).toBe(true);
});
```

- Standalone components go straight into `imports` — no NgModules.
- **Inputs are set with `componentRef.setInput(...)`**, never by assigning to the
  instance field (they are `InputSignal`s).
- Assert on the rendered BEM classes (`rtui-button--size-md`) and on real
  directive instances via `fixture.debugElement.query(By.directive(MatButton))` —
  that is how this kit proves modifiers and the Material bridge actually apply.
- Content projection needs a host wrapper component declared in the spec file:

    ```typescript
    @Component({
        template: '<rtui-button type="pill">Projected label</rtui-button>',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [RtuiButtonComponent],
    })
    class ProjectionHostComponent {}
    ```

- To re-provide a token per case, `TestBed.resetTestingModule()` then reconfigure
  (see the design loop in `rtui-button.component.spec.ts`).
- Config-driven components are worth testing across the whole resolution ladder:
  instance input → `components.<name>` → `global` → library default.

## Style inside specs

The repo's TypeScript rules apply to specs too — explicit types on locals
(`const fixture: ComponentFixture<X> = …`), explicit return types on helpers,
single quotes. Only the custom `rt/*` workspace rules skip `*.spec.ts`.

---

# `@rt-tools/ui-kit-v2`

Same Jest, own harness. Do not hand-roll a TestBed here — `src/testing/rt-kit-testing.ts`
already does it.

```bash
pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=<relative-path>
pnpm exec nx run @rt-tools/ui-kit-v2:typecheck   # tsc --noEmit over tsconfig.spec.json
```

`typecheck` exists because Jest transpiles without checking types and ESLint is
not type-aware here: specs went untypechecked entirely until 13 errors surfaced
across 7 files. It runs in `check:all`, `check:affected` and CI — a spec that
compiles under Jest can still fail it.

## The harness

`src/testing/rt-kit-testing.ts` — `createRtFixture(Component, inputs)`,
`provideRtKitTesting()`, `setInputs`, `qa` / `qaAll` (by `qa-dataid`), `el` / `els`,
`classesOf`, `hostClasses`, `textOf`, `renderedText`, `fileListOf`. Both
`src/testing/**` and `src/showcase/**` are excluded from the library build.

Four substitutions that are not obvious:

- **Quill** does not start in jsdom — it fails while loading. The module is
  replaced at import level with `src/testing/quill-mock.ts`:
  `jest.mock('quill', () => ({ __esModule: true, default: QuillMock }))`, needed by
  `rich-editor`, `message-composer` and `chat`. The mock can `typeText()` and
  `press()` a declared key binding.
- **Transloco** needs a loader even though the kit's dictionaries are bundled —
  return `of({})`.
- **Viewport width** measures nothing in jsdom; components that reflow by it
  (`table`, `filter-control`) take a substituted `BreakpointsService`.
- **Overlays** need `ApplicationRef.tick()` — `fixture.detectChanges()` does not
  reach content rendered into a CDK overlay.

## Coverage contract

Under law `docs/constitution/verifiability.md`. Counts as of 2026-08-06: 81 specs
for 94 components and directives; 11 folders hold fewer specs than components
(`aside` 2/4, `table` 3/8, `dialog` 1/3, `menu` 1/3, `tabs` 1/3, and six more).

- **Every component and directive owns a spec**, including the ones nested inside
  a family. A family spec covering the parent is not coverage for the children.
- **A promised behaviour is named as a scenario and named again in the test that
  proves it.** `CONTEXT.md` states these behaviours per component — its «Главное,
  что нужно знать» and «Края» sections are the scenario list.
- **A scenario with no test is marked uncovered and visible**, not silently
  absent.
- **An assertion that cannot fail is not coverage.** Already found here:
  `toBeLessThanOrEqual(1)` on zero events, `length >= 0`, a test that never
  mounted the component, a query for a `qa-dataid` present in no template
  (`UI-KIT-V2-ISSUES.md` §7).
- **Visible state is proved by showing it, not only by asserting a class** — that
  half belongs to the showcase; see the `rt-tools-storybook` skill.
- `passWithNoTests` is on. A green target is not proof the spec ran — read the
  reported test count.

## Gotchas

- **It is Jest, not Vitest** — `jest.fn()`, `jest.spyOn()`, `describe/it/expect`
  from `@types/jest`. Do not import from `vitest`.
- `@angular/cdk/*` and `@angular/material/*` are mapped to their `fesm2022` builds
  via `moduleNameMapper` in `projects/ui-kit/jest.config.ts`; a new deep import
  from a package shipped only as ESM may need a `transformIgnorePatterns` /
  mapper entry there.
- Coverage lands in `coverage/<displayName>` (e.g. `coverage/rt-ui-kit`).
- CI runs `nx affected -t lint test build` against `origin/main`
  (`.github/workflows/ci.yml`) — a spec that only passes locally blocks the PR.
