# The uniformity signs — where this is in the tree

The first column is the article verbatim, as it is written in the "Rules" section of the subdomain
spec.

- **A uniformity sign lives as data, not as the code of the check.** — `projects/agent-kit/assets/checks/signals.mjs:loadSignals`
- **A check that got not a single sign refuses, it does not answer zero.** — `projects/agent-kit/assets/checks/signals.mjs:loadSignals` — the refusal is thrown by the loader and printed as a line by `checks/check-reuse.mjs`; scenario SC-AK-813
- **A sign naming a global judges the position of the name, not a substring.** — `projects/agent-kit/assets/checks/signals/core.json:raw-window` — string literals are removed by the field `strip`, a declaration of one's own puts the sign out by the field `cancel`, the server roots are cut off by `skipBackendRoots`; scenarios SC-AK-814 and SC-AK-815
- **A sign bundle is cut by the rt-tools packages.** — `projects/agent-kit/assets/checks/signals.mjs:BUNDLES_DIR`
- **A tree gets the signs of the packages it named.** — `projects/agent-kit/assets/checks/signals.mjs:readBundle`
- **A tree appends signs, it does not edit foreign ones.** — `projects/agent-kit/assets/checks/signals.mjs:byKey`
- **The source folder of the ready-made is taken out from under a sign apart from the bundle.** — `projects/agent-kit/assets/checks/check-reuse.mjs:exceptNamed` — the reverse path sample is read by the check and by the guard `projects/agent-kit/assets/hooks/reuse-first-guard.sh`; scenario SC-AK-874
- **The directives of the tree's own design system are cut out of the signs of native tags.** — `projects/agent-kit/assets/checks/signals.mjs:withKitDirectives` — the list arrives by the key `reuse.kitDirectives`, the cutting is appended to the field `strip` of the sign; scenario SC-AK-817
