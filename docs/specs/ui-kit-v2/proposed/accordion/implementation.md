# Binding — the accordion

The code is not written yet, so there is no binding of the form `file:symbol` here: the agreement
is written before the code. Only the foreseen places stand here, so that the merge into the spec of
the domain shows where to look.

## Where the rules are foreseen to be carried out

| Rule                                        | Where it is foreseen                                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| the items arrive by a required input        | `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.ts`                                    |
| a press opens or closes one item only       | `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.logic.ts`                                        |
| one item open on the entry, new items anew  | `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.logic.ts` and the linked signal of the component |
| the toggle, the heading, the arrow, the ids | `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.html`                                  |
| the line, the colours, the layer            | `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.scss`                                  |
