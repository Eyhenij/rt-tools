# The labels of `@rt-tools/ui-kit-v2` move to the application

## The context

The kit carries its own labels sewn in: `src/lib/i18n/rt-kit-translations.ts` — 131 keys in eight
languages, 1077 lines, laid out by `provideRtKitTranslations()`. They are reached by 43 folders of
components — 197 places, of them 147 straight in the templates through `| transloco`.

The language at that is decided not by the application but by the active locale of Transloco. In the
showcase it is `en`, and the kit's own labels stand mixed with the Russian demonstration content:
"Cancel" next to «Отклонить заявку», "Drop the files to attach them" — next to «Отпустите, чтобы
приложить». The mixture is visible in all three done waves of the coverage.

The labels are the responsibility of the application. The kit knows neither the language of the
product, nor its vocabulary, nor how the product names its entities; to keep eight vocabularies inside
the package means to impose on the consumer both the set of the languages, and the wordings, and
Transloco as the way of the delivery.

The task #271. Uncovered by a walk with the eyes over the wave 3 of the line of the coverage of the
states — it is closed and lies as a record about the closed line of the coverage of the states (PR
#270); it is removed from the tree by the term of the keeping and lies in the history.

## The accepted decisions

1. **The kit takes the labels by a translator function from a token.** The keys stay its own, the
   vocabularies are the application's. Rejected: a label as an input per key (at the chat that is 24
   new inputs, hundreds in all, and the consumer passes them in the markup of every place).
2. **The English set stays inside the kit as a default.** Not as a localisation but as a default of
   the token: among the 131 keys there are many `aria` labels, and an empty one there means a button
   without a name for a screen reader. The application overrides partially — the passed keys lie over.
3. **The seven remaining languages are deleted from the package** (`de`, `hi`, `ko`, `ru`, `th`,
   `zh-Hans`, `zh-Hant`). Since the wordings are the responsibility of the application, so are the
   translations. Whoever needs them will take them from the git history.

## What counts as done

- In `projects/ui-kit-v2/src/lib/**` there is not a single import from `@jsverse/transloco`.
- `@jsverse/transloco` is removed from the `peerDependencies` of the kit.
- One vocabulary is left in the package — the English one, and it is declared a default, not a language.
- An application that gave nothing gets a working kit on the English labels; an application that gave
  a function of its own gets its own — including those that change at a change of the language on the
  fly.

---

## The device

Three things in `src/lib/i18n/`:

| what                | what for                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `RT_KIT_TRANSLATOR` | `Signal<TRtKitTranslator>` — what the application gives. The default reads the English set   |
| `RT_KIT_LABELS`     | `Signal<TRtKitLabelMap>` — the derived map of all the keys, root-scoped: it is built once    |
| `RT_KIT_LOCALE`     | `Signal<string>` — the active locale; the kit formats the dates by it. The default is `'en'` |

```typescript
export type TRtKitLabelKey = keyof typeof RT_KIT_LABELS_EN;
export type TRtKitLabelParams = Readonly<Record<string, string | number>>;
export type TRtKitTranslator = (key: TRtKitLabelKey, params?: TRtKitLabelParams) => string;
```

The function is not signal by itself — it is the **token** that is declared a signal: at a change of
the language the application changes the function, `RT_KIT_LABELS` is recounted, and all the templates
are redrawn.

**A component reads the map whole, not a key one at a time:**

```typescript
protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);
```

```html
<button [attr.aria-label]="t().uiClose"></button>
```

One field per component instead of N, full reactivity without `pure: false`, and the key is checked by
the type of the map — a typo does not live to the runtime. A pipe is rejected: `pure` will not
recompute at a change of the language (the argument is the same), `impure` would be called at every
check in 147 places, including the lists of the chat and the tables.

**Five keys with a substitution** (`uiBaseline`, `uiDownloadFile`, `uiPageOf`, `uiRangeOf`,
`uiSectionInProgress`) do not fit the map — they need parameters. For them there is
`rtKitLabel(key, params)`, where `params` is a signal or a value; it gives back `Signal<string>`. The
technique is already applied in `rt-stat-tile`.

## What breaks at the consumer

- **`provideRtKitTranslations()` disappears.** Instead of it there is `provideRtKitLabels(...)`, taking
  a translator function and a locale.
- **The seven vocabularies are no longer in the package.**
- **`RtRouteAsideBase.successKey` becomes `successText`.** Now the base calls
  `transloco.translate(opts.successKey)` — that is, it translates **a key of the application**, not its
  own. The application translates it itself and passes the ready text: foreign keys do not concern the
  kit.
- **`@jsverse/transloco` leaves the peer dependencies.** An application that uses it loses nothing — it
  is the one giving the function wrapped around `translateSignal`.

---

## The order of the works

By batches, so that each is checked apart.

1. **The core of the i18n.** The English set → `rt-kit-labels.en.ts`; the tokens and
   `provideRtKitLabels` → `rt-kit-labels.providers.ts`; `rtKitLabel()` for the substitutions. The seven
   vocabularies and `provideRtKitTranslations` are deleted. The spec of the providers is rewritten.
2. **The harness of the specs.** `src/testing/rt-kit-testing.ts` stops raising Transloco: instead of
   the loader there is the default of the token or a substituted function.
3. **The components with a substitution** (5 places): `pagination`, `download-link`, `page-header`,
   `stat-tile`, plus `container` with its `successKey`.
4. **The components by one or two keys** — the tail of 30 folders.
5. **The components with dense markup**: `chat` (25), `workspace-details` (23), `page-header` (16),
   `pagination` (14), `field` (12), `aside/unsaved-dialog`, `counter`, `table/settings-aside`.
6. **`rt-chat` and the locale** — `RT_KIT_LOCALE` instead of `langChanges$`.
7. **The showcase.** `preview.ts` loses `provideTransloco` and the loader; the demonstration labels are
   set by a translator function with a Russian set — then the showcase stops being bilingual.
8. **`package.json`** — `@jsverse/transloco` out of `peerDependencies`.
9. **The documentation**: the `README.md` of the kit, the `CONTEXT.md` of the touched folders, the
   pages `Overview.mdx` where the labels are declared as inputs, the `CHANGELOG.md` — the section
   `BREAKING CHANGES`.

## The check

```bash
pnpm run check:all
pnpm exec nx run @rt-tools/ui-kit-v2:typecheck
pnpm exec nx verify @rt-tools/ui-kit-v2
pnpm run build-storybook:ui-kit-v2
pnpm run agent-kit:check
grep -rn "@jsverse/transloco" projects/ui-kit-v2/src/lib   # must be empty
```

Then by the eyes: the showcase in one language, not a single English label among the Russian content.
To be looked at with the tab **active** — the panel stories hold on the frames of the animation.
