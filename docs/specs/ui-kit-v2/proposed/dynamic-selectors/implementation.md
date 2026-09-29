# What it is carried out by — the dynamic selectors

The components are not written yet, so the rules that live in them have no binding here: the place
appears together with the code. Below are the foreseen places.

| Rule                                                                                               | Where it is foreseen                                                                  |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| reset, clear, read-only keys, dragging, offer, search, select all                                  | `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.ts` |
| pinned divider, single mode, apply and cancel of the ticks                                         | `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.ts` |
| trimming, duplicates and editing of the string list                                                | `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.ts` |
| the value in the form, the initial value, an unknown key, an empty write, the invitation, disabled | the component `rt-dynamic-selector`                                                   |
| search debounce, multi toggle, next page, empty result, footer link                                | the component `rt-dynamic-selector-popup`                                             |
| the row delete, the drag handle, the row controls of the caller                                    | the chosen list component of the family                                               |
| Enter and leaving the field of the string list                                                     | the component `rt-dynamic-input`                                                      |
| the labels of the family                                                                           | `projects/ui-kit-v2/src/lib/i18n/`                                                    |
| the sample of the behaviour                                                                        | `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/` — read, not edited                |
