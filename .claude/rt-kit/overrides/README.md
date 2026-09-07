# Overrides on top of the laid-out resources

Here goes what this repository appends to the text of `@rt-tools/agent-kit`. The file path
repeats the resource identifier: `laws/verifiability.md` is overridden by the file
`laws/verifiability.md` next to this README.

A laid-out file is not edited in place: the edit is lost on the next `pnpm run agent-kit:sync`,
and the layout refuses such a file instead of rewriting it silently.

The merge goes by `## ` sections:

| In the override              | What happens                       |
| ---------------------------- | ---------------------------------- |
| a heading the package has    | the section is replaced in full     |
| a heading the package lacks  | the section is appended at the end  |
| a heading with an empty body | the package section is lifted       |

A resource is dropped in full not here but by the `skip` list in `.claude/rt-kit.json`.
