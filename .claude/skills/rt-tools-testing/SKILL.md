---
name: rt-tools-testing
description: Write or run unit tests in this kit — Jest (not Vitest) with jest-preset-angular, a zoneless TestBed, setInput-driven fixtures and DOM-class assertions. Use when creating or editing any *.spec.ts, adding coverage for a component/service/pipe, or running a single test file.
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
