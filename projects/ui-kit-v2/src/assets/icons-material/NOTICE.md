# Material drawings of the second icon set

The files next to this notice come from Google's Material Symbols — the `materialsymbolsoutlined`
family, size 24 — and are licensed under Apache License 2.0. The upstream project is
`google/material-design-icons`; its license text lives there.

Two things were changed on the way in and nothing else:

- **The file is named by the kit name, not by the Material one.** The registry asks for a drawing
  by the kit's own name, and which Material name closed it is known to the correspondence list in
  `projects/ui-kit-v2/src/lib/components/icon/rt-icon-material-map.ts`.
- **`fill="currentColor"` is set on the body.** Without it the drawing paints itself black on
  every theme: the upstream file declares no fill at all.

The drawings were fetched once and are kept under version control — no Material package is a
dependency of this tree, and that is the point of the second set. The fetch is recorded by
`tools/fetch-material-icons.mjs`: it says which Material name closed which kit name and where the
file came from.
