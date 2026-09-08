# The binding — the guard of the wording

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **Officialese and words not written in the tree do not go away into a document.** — `projects/agent-kit/assets/hooks/prose-style-guard.sh:found`
- **Every finding is named together with a replacement.** — `projects/agent-kit/assets/checks/check-prose-style.mjs:MARKS`
- **A write by a shell command is judged the same as one by the edit tool.** — `projects/agent-kit/assets/hooks/prose-style-guard.sh:rt_write_targets` — the shared parse names the document among the write targets; scenario `SC-AK-928`
- **Only the new text of the edit is judged.** — `projects/agent-kit/assets/hooks/prose-style-guard.sh:added`
- **The boundaries of a word are counted by letters, not by the class `\w`.** — `projects/agent-kit/assets/checks/check-prose-style.mjs:GLOSSARY_BANS`
- **The signs of officialese exist in each language of the layer, and both sets judge every line.** — `projects/agent-kit/assets/checks/check-prose-style.mjs:MARKS_EN` — the English set with the Latin word boundary, applied together with the Russian one in `findingsIn`; scenario `SC-AK-903`
- **A word that is also a noun is checked by what stands after it.** — `projects/agent-kit/assets/checks/check-prose-style.mjs:MARKS` — the sample of the plural form demands a word from the list of roots after it; scenario `SC-AK-859`
