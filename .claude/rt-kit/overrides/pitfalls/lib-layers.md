## Import cycles inside the package

The check is `npm run check:cycles`. It reads the relative imports of every file under
`projects/` and names each cycle by its members, from file to file.

- **A cycle starts through a directory barrel.** A file takes its neighbour not directly but from
  the `index.ts` next to it, and that one collects the file itself as well. It is broken by a
  direct file import: `from './index'` becomes `from './table-column.interface'`.
- **Neither the build nor the linter judges a cycle.** The bundler breaks it itself and hands one
  of the members a half-assembled module; it surfaces at the consumer — a symbol read at startup
  turns out empty.
- **Mutual recursion of two functions is not cured by a barrel.** Two deep-comparison functions
  call each other in essence, and apart they are a cycle in any case: both live in one module,
  and the former addresses of the symbols stay thin re-exports.
- **A component taken as a parent through `inject` is replaced by a token.** A side-menu subitem
  injected the menu component itself, and the menu declared the subitem among its imports; a
  token in the types file separates the two.
- **Types both sides need move to a file of their own.** The kit config named the button
  appearance by types from its component file — a cycle of types alone survives the build, but it
  lives only until the first edit that adds a value to it.
- **The check stands in the push gate set and in the pipeline.** A cycle removed once comes back
  with the first edit nearby, and there is nothing to notice it with.
