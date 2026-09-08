# Binding — divergences inside the rules layer

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A profile override the rule companion is silent about is a divergence.** — `projects/agent-kit/assets/checks/check-profile-drift.mjs:unnamed` — the name is looked for across all the `implementation.md` of the rules directory; scenarios SC-AK-765, SC-AK-766
- **A replacement counts as a divergence of the value from the package default, not as the profile line itself.** — `projects/agent-kit/assets/checks/check-profile-drift.mjs:overridden`; scenario SC-AK-767
- **The name of an override is looked for across all the companions of the tree, not in the companion of one rule.** — `projects/agent-kit/assets/checks/check-profile-drift.mjs:companionsText`; scenario SC-AK-766
- **A check the package default calls while the set of the tree does not is named by the audit.** — `projects/agent-kit/assets/checks/check-profile-drift.mjs:cutFromGate` — the set is assembled by a shell call twice, with the override and without it; the name of the check file is checked, not the line of the command; scenarios SC-AK-782, SC-AK-783, SC-AK-784, SC-AK-785
- **A branch of the body that is not in the declaration of the guard is a divergence.** — `projects/agent-kit/assets/checks/check-hook-scope.mjs:branchedTools`; scenarios SC-AK-769, SC-AK-771
- **A divergence of a declaration is fixed in the package, and the tree pays for it.** — **Not checked** by anything. The audit names the divergence, and where to fix it the reader of the refusal knows: the line about the edit in the source stands in the text of the refusal itself
- **The sample of a declaration is read as an expression, not as a list of names.** — `projects/agent-kit/assets/checks/check-hook-scope.mjs:covers`; scenario SC-AK-770
