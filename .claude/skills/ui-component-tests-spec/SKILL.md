---
name: ui-component-tests-spec
kind: pattern
rule: ui-component-tests
description: A pattern of the rule ui-component-tests. Take it when a spec next to a kit component is created or edited: the first kit's fixture builder, the second kit's harness, a host wrapper for an application input, hand-written service doubles. The story — ui-component-tests-visual.
---

# A component's spec — ready-made code

The pieces here are carried into the spec file next to the source. What lies where in the tree and
which runner is used — next to the rule `testing`, the file `implementation.md`.

## When to use

- A `*.spec.ts` next to a kit component is created or edited.
- The component does not come up in an environment without a browser, and what stands in for it has
  to be known.
- An input from the application is checked by a host, and a service by a double.

## The first kit: a `setup()` of its own

The first kit has no harness, and the fixture builder is written in the spec file. The ready-made
shape:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('RtuiThingComponent', () => {
    function setup(): ComponentFixture<RtuiThingComponent> {
        TestBed.configureTestingModule({ imports: [RtuiThingComponent] });

        const fixture: ComponentFixture<RtuiThingComponent> = TestBed.createComponent(RtuiThingComponent);

        // The inputs are reactive: an assignment to an instance field does not change them.
        fixture.componentRef.setInput('size', 'md');
        fixture.detectChanges();

        return fixture;
    }

    /** The block modifiers hang on the host — the class is declared by the decorator, not by markup. */
    function blockClasses(fixture: ComponentFixture<RtuiThingComponent>): DOMTokenList {
        return (fixture.nativeElement as HTMLElement).classList;
    }

    it('puts the size modifier on the host', () => {
        expect(blockClasses(setup()).contains('rtui-thing--size-md')).toBe(true);
    });
});
```

The bridge to Material is proved by a real instance of the directive, not by a search for a class:

```typescript
fixture.debugElement.query(By.directive(MatButton))?.componentInstance;
```

## The second kit: the shared harness

```typescript
import { createRtFixture, hostClasses, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';

// The inputs go as the second argument; the third adds providers and imports on top of the harness.
const fixture: ComponentFixture<RtThingComponent> = createRtFixture(RtThingComponent, { size: 'md' });

// `qa` searches by the anchor for specs; `textOf` and `classesOf` tolerate `null` and return
// emptiness — so a claim about text is checked together with the node's existence.
expect(qa(fixture, 'thing-label')).not.toBeNull();
expect(textOf(qa(fixture, 'thing-label'))).toBe('Ready');
expect(hostClasses(fixture)).toContain('rt-thing--size-md');

// A batch of inputs after the raising — and a redraw of one's own: the harness does not run it.
setInputs(fixture, { size: 'lg', disabled: true });
fixture.detectChanges();
```

`provideRtKitTesting()` already gives what no component comes up without: the request client with a
stub, the storage, `PlatformService`, the table settings storage. Your own is added by `providers`
in the options, not on top of the harness.

## An input from the application is checked by a host

A component whose input overrides its own measurement is checked through a host wrapper — and the
value in it is **reactive**: the host redraws on demand, and an edit of an ordinary field does not
refresh the binding.

```typescript
@Component({
    template: '<rtui-thing [isMobile]="mobileInput()" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtuiThingComponent],
})
class HostComponent {
    public readonly mobileInput: WritableSignal<boolean | null> = signal<boolean | null>(null);
}
```

## A double of a service

A service declared without a root scope is substituted at the component itself — otherwise the
double does not reach it:

```typescript
TestBed.overrideComponent(RtuiThingComponent, {
    set: { providers: [{ provide: BreakpointService, useValue: breakpoints }] },
});
```

The double is written by hand and returns what the scenario asks for:

```typescript
class BreakpointServiceStub {
    public readonly narrow: WritableSignal<boolean> = signal(false);

    public get isMobile(): Signal<boolean> {
        return this.narrow.asReadonly();
    }
}
```

## An environment without a browser

- There is no `PointerEvent` — a `MouseEvent` with the same event name is taken.
- There is no `HTMLElement.scrollTo`.
- `currentColor` arrives in lower case.
- The theme service puts the choice into the storage — between tests it is cleared.
- The stand is zoneless: an unknown element drops the spec instead of drawing emptiness, so a
  missing import is visible at once.
- **Jest does not digest `import localeRu from '@angular/common/locales/ru'`** — the language data
  lies in an `.mjs`, and on the showcase the same import works. The spec takes `LOCALE_ID: 'en-US'`,
  whose data is built in.

## Common misses

Substitutions that are not thought of on the first approach.

- **The width of the window measures nothing.** The narrow view is reached by substituting the
  breakpoints service rather than by the fixture's size: a media query does not fire at all in an
  environment without a window.
- **The translation loader is obliged to return a stream.** A ready object is swallowed inside, the
  language stays empty, and the text check silently confirms an empty string.
- **The text editor does not come up in an environment without a browser** and is substituted by a
  double; the substitution must carry the module sign, otherwise an object arrives instead of the
  constructor.
- **Content in an overlay does not draw by itself.** After the opening a
  `TestBed.inject(ApplicationRef).tick()` is needed, and it is looked for by the document rather
  than by the fixture.
- **An output is substituted by an object, not by a call of `output()`.** A hand-written double of a
  component with outputs fails with `NG0203`: `output()` is not called outside an injection scope.
  The field is declared with the type `OutputRef` and returns
  `{ subscribe: () => ({ unsubscribe: () => {} }) }`.
- **What the component reads by a field is filled before the raising.** `createRtFixture` creates
  the component at once, and a registry read by a field initializer will already be empty. Such a
  spec is assembled by hand — `TestBed.configureTestingModule` and `TestBed.inject` before
  `TestBed.createComponent`, not through the harness.
- **A component declared uncoverable because of "too big a harness" is checked by a double, not by
  an appraisal.** The argument is dropped only after an attempt: the table settings panel was
  written down as debt with the argument "a raised frame is needed", and a substitution of its owner
  by an object of seven lines was enough.
