# What it will be carried out by — the settings of the kit and the theme

There is no code yet, so there is not a single binding of the shape `file:symbol` here: the
agreement is written before the code, and the place of execution appears together with it. Below are
the foreseen places, so that at the merge into the spec of the domain it is visible where to look.

New files are not named by an address on purpose: an address that does not exist yet reads as an
instruction to look for it.

## Where the execution is foreseen

| Rule                                                            | Where it is foreseen                                                                                                                                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| the kit works when no settings are given at all                 | a new module of the settings next to `projects/ui-kit-v2/src/lib/platform/theme.service.ts`; the form of the handing out is `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.providers.ts`    |
| the order of four levels, the first answer wins                 | the same module — the resolution lives next to the settings, not in every node                                                                                                              |
| a field not named falls through, a part does not blank the rest | the same module                                                                                                                                                                             |
| the settings are read once, when the node is created            | `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts` — the value its inputs start with                                                                                     |
| a default of a node only for a look the node takes as an input  | the same file; the three looks are the appearance, the size and the roundedness                                                                                                             |
| an input written in the markup wins over the settings           | the same file — the value an input starts with is used only where the markup binds nothing                                                                                                  |
| only the button and the curtain carry defaults of their own     | `projects/ui-kit-v2/src/lib/components/aside/rt-aside.service.ts` — the field of the key of closing is already optional there, so only the line that resolves it changes                    |
| the theme has three states                                      | `projects/ui-kit-v2/src/lib/platform/theme.model.ts` — the third value of the mode                                                                                                          |
| the third state resolves into one of the two looks              | `projects/ui-kit-v2/src/lib/platform/theme.service.ts`                                                                                                                                      |
| what is kept is the choice, not the look                        | the same file; the key is `projects/ui-kit-v2/src/lib/platform/storage-keys.enum.ts`                                                                                                        |
| a kept choice wins over the common default                      | the same file — the reading at the start                                                                                                                                                    |
| a kept word the kit does not know is ignored                    | the same file — the same reading                                                                                                                                                            |
| the machine is followed while the page is open                  | the same file — the subscription to the answer of the browser about the dark look                                                                                                           |
| without a window nothing is read, written or put at the root    | the same file — the service of the platform of the core package is already asked there                                                                                                      |
| a node carrying a theme of its own, in both directions          | a new mark of the markup next to the service of the theme; the set it leans on lives in `projects/ui-kit-v2/src/styles/_theme-dark.scss` and `projects/ui-kit-v2/src/styles/_semantic.scss` |
| the mark switches the whole set of the properties               | the same two mixins, emitted for a node by `tools/build-tokens-v2.mjs` from `projects/ui-kit-v2/src/styles/tokens.source.mjs`                                                               |
| the nearer mark wins, a repeated one changes nothing            | the same rules of the styles — the sign at the node is read by the cascade, not by code                                                                                                     |
| the local piece touches neither the choice nor the keeping      | the new mark — it holds no state and calls the service for nothing                                                                                                                          |
| the surface reaches the consumer                                | `projects/ui-kit-v2/src/lib/platform/index.ts` and `projects/ui-kit-v2/src/public-api.ts`                                                                                                   |

## What has no foreseen place

The order of four levels has a middle step that nothing reads: with the field of Material gone, no
field of the settings stands both at the level of a node and at the common level. The order is
promised whole, and the step stays unused until the owner names a field for it — that is the first
open question of the agreement.

## The price named by the measurement

The chosen road for the defaults of the nodes does not change the public shape of a single input:
the field of the settings is asked in the directive before the inputs are declared, and the value an
input starts with is counted from it. So the family of the button keeps its inputs, its tests and its
description as they are. The price is the other one and it is written into the agreement: the
settings are read once, at the creation of a node.

The curtain is cheaper still — its field of the key of closing is already optional, and only the line
that resolves it moves.

The local piece is the one place where the work reaches outside its own agreement: the two mixins
exist whole, but today they are emitted for the root of the page alone.

## Scenario — test

- **`SC-UKV-330`**…**`SC-UKV-349`** — twenty scenarios, and there is no test for any of them:
  neither the settings, nor the third state of the theme, nor the local piece, nor the story of the
  showcase exist yet. Each scenario carries the mark "Not covered" with its own reason.

The frame of the showcase is a scenario on its own — `SC-UKV-349`. It is taken against the reference
of the second kit alone: the showcase of the first kit has no story of its theme or its local piece
at all, so the pair of frames the card of the task asks for cannot be taken.
