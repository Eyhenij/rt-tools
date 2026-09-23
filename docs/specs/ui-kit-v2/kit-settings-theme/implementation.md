# What it is carried out by — the settings of the kit and the theme

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **The kit works when the application gives no settings at all.** — The token carries a factory of its own giving an empty object. A consumer that hands out nothing still gets a value to inject — `projects/ui-kit-v2/src/lib/config/rt-kit-config.providers.ts:RT_KIT_CONFIG`; scenario `SC-UKV-330`
- **The look of a node is resolved from the particular to the general: the input at the place, the default of the node, the common default, the default of the kit.** — The answer comes from `projects/ui-kit-v2/src/lib/config/rt-kit-config.providers.ts:rtKitDefault`. It lives in one place rather than in every node. The input at the place stands above it by the way it is used: what the function returns is the value the input starts with. Scenarios `SC-UKV-331`, `SC-UKV-332`
- **A field the settings do not name falls through to the next level, and an object given in part does not blank the rest.** — The same function answers. Every step of it is an optional read, and the first answer that is not empty wins — `projects/ui-kit-v2/src/lib/config/rt-kit-config.providers.ts:rtKitDefault`; scenario `SC-UKV-333`
- **The settings are read once, when a node is created.** — The directive asks the settings in a field of its own, and the field is counted at the creation of the node — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:#appearance`; scenario `SC-UKV-334`
- **A default of a node is promised only for a look the node already takes as an input.** — The settings of the button hold exactly the three inputs the family already has — `projects/ui-kit-v2/src/lib/config/rt-kit-config.model.ts:Button`; scenario `SC-UKV-333`
- **An input written in the markup wins over the settings, and the settings change nothing the markup already says.** — The settings give the value the input starts with. The framework replaces it with what the markup binds — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:appearance`; scenario `SC-UKV-331`
- **Only the button and the curtain carry defaults of their own.** — The set of the families is a closed type of two fields — `projects/ui-kit-v2/src/lib/config/rt-kit-config.model.ts:Components`. The curtain resolves its own in one line — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.service.ts:#closeOnEscape`; scenario `SC-UKV-335`
- **The theme has three states: the light one, the dark one and "follow the machine".** — The choice is a type of its own next to the look — `projects/ui-kit-v2/src/lib/platform/theme.model.ts:Choice`; scenario `SC-UKV-336`
- **"Follow the machine" resolves into one of the two looks, and the kit puts no third sign at the root of the page.** — The resolution is a derived value — `projects/ui-kit-v2/src/lib/platform/theme.service.ts:current`. What goes to the root is its answer; scenario `SC-UKV-336`
- **What is kept is the choice, not the look it resolved to.** — The writing takes the choice while the sign takes the resolved look, and both stand in one effect — `projects/ui-kit-v2/src/lib/platform/theme.service.ts:#choice`. The key is `projects/ui-kit-v2/src/lib/platform/storage-keys.enum.ts:Theme`; scenario `SC-UKV-337`
- **A choice already kept wins over the common default of the settings.** — The reading at the start asks the keeping first and the settings after — `projects/ui-kit-v2/src/lib/platform/theme.service.ts:#readOrDefault`; scenario `SC-UKV-338`
- **A kept value the kit does not know is ignored, and the settings answer instead.** — The same reading judges the kept word against the set of the known ones — `projects/ui-kit-v2/src/lib/platform/theme.service.ts:#readOrDefault`; scenario `SC-UKV-339`
- **While "follow the machine" is chosen, a change of the setting of the machine reaches the page without a reload.** — The answer of the browser is subscribed to — `projects/ui-kit-v2/src/lib/platform/theme.service.ts:#watchMachine`. The subscription dies with the owner; scenario `SC-UKV-340`
- **Everything derived from the theme is recounted when the theme changes.** — The choice is a signal, and the look and the dark sign are derived from it — `projects/ui-kit-v2/src/lib/platform/theme.service.ts:isDark`; scenario `SC-UKV-341`
- **Where there is no window, the kit neither reads the keeping, nor writes it, nor puts the sign.** — Both places ask the platform service of the core package before they touch the document — `projects/ui-kit-v2/src/lib/platform/theme.service.ts:#platform`; scenario `SC-UKV-342`
- **A window that cannot ask the machine leaves the kit working.** — The ability of the window is asked before the question is put — `projects/ui-kit-v2/src/lib/platform/theme.service.ts:#watchMachine`; scenario `SC-UKV-350`
- **A node carrying a theme of its own draws its subtree in it, and the page around it stays as it was.** — The mark puts the sign on the node it stands at — `projects/ui-kit-v2/src/lib/platform/rt-theme-scope.directive.ts:RtThemeScopeDirective`. The rules it leans on are emitted into `projects/ui-kit-v2/src/styles/_theme-scope.scss`; scenario `SC-UKV-343`
- **The piece works in both directions.** — Both islands are emitted, the light one on a par with the dark — `tools/build-tokens-v2.mjs:SCOPE_NOTE`; scenario `SC-UKV-344`
- **The mark at a node switches the whole set of the properties, not a part of it.** — Every rule of the island declares the whole set on one node, not the difference from the page. A reference of a property resolves where it is declared, not where it is read — `tools/build-tokens-v2.mjs:SCOPE_NOTE`; scenario `SC-UKV-343`
- **The nearer mark wins over the farther one.** — The rules of the island are of equal force, and the nearer node wins by standing closer rather than by the selector — `tools/build-tokens-v2.mjs:SCOPE_NOTE`; scenarios `SC-UKV-345`, `SC-UKV-346`
- **A mark taken off returns the subtree to the theme of the page.** — An empty value gives no attribute at all — `projects/ui-kit-v2/src/lib/platform/rt-theme-scope.directive.ts:rtTheme`; scenario `SC-UKV-347`
- **The local piece touches neither the choice of the person nor the keeping.** — The mark holds no state and injects nothing — `projects/ui-kit-v2/src/lib/platform/rt-theme-scope.directive.ts:RtThemeScopeDirective`; scenario `SC-UKV-348`
- **The sign at a node means the same as the sign at the root.** — The island includes the very mixins the root includes. The root is cut out of every rule of the island, so the layering of the page stays as it was — `tools/build-tokens-v2.mjs:SCOPE_NOTE`; scenario `SC-UKV-343`

## What has no place in the tree

The order of four levels has a middle step that nothing reads: no field of the settings stands both
at the level of a node and at the common level at once. The order is promised whole, and the step
stays unused until the owner names a field for it — that is the first open question of the
agreement.

## The surface

The handing out, the token, the mark and the types leave for the consumer by
`projects/ui-kit-v2/src/lib/platform/index.ts` and `projects/ui-kit-v2/src/public-api.ts`.

## The frame of the showcase

The last scenario, `SC-UKV-349`, is closed by no test: a frame is held by a reference of the
showcase, and the references of the second kit live in
`projects/ui-kit-v2/.storybook/__snapshots__`. It is taken against the reference of the second kit
alone. The showcase of the first kit has no story of its theme or its local piece at all, so the
pair of frames the card of the task asks for cannot be taken.
