# Grill

## The owner request

> getColorBasedOnBackground это переносилось во второй кит или в утилиты?

The answer was: neither. The function lives only in the first kit, in its info badge folder, next
to `darkenHexColor`; the second kit's tag overview marks both as not carried over, because the
tag has a closed palette. Then the owner chose:

> Перенести в utils (Recommended)

The owner's standing words for the consumer's migration from the first kit: «делай не так как
просят а так как лучше», and the first kit is not touched.

## What the tree already has

- `getColorBasedOnBackground(backgroundColor)` in the first kit computes the relative luminance of
  a six-digit hex colour and returns `#fff` for a dark background, else the background darkened by
  half through `darkenHexColor`.
- `darkenHexColor(hex, percent)` accepts three- and six-digit hex with or without `#`; the first
  function strips the first character blindly and reads six digits, so `#fff` gives `NaN` channels
  and falls through to `#fff`, and a colour without `#` loses its first digit.
- `@rt-tools/utils` keeps one function per directory with a spec and a `CONTEXT.md`, exported by
  the functions barrel. It has no spec directory under `docs/specs/`.
- No helper in `@rt-tools/utils` or `@rt-tools/core` computes contrast or parses hex.

## Questions and answers

**getColorBasedOnBackground lives only in the first kit. Move it to @rt-tools/utils for the
application?**
Перенести в utils (Recommended)

## Decisions

- **Both functions move under their names, `getColorBasedOnBackground` and `darkenHexColor`.** The
  application changes only the import path. Rejected: new names — a second migration step for no
  gain.
- **On a six-digit colour with `#` both return exactly what the first kit returns.** That is the
  form the first kit was used with, and a migrated badge keeps its colours.
- **The utils version reads three- and six-digit hex, with or without `#`, in both functions.** In
  the first kit a short or bare colour gave a wrong answer silently. Rejected: a byte-for-byte copy.
- **A value that is not a hex colour gives `#fff` from the first function and comes back unchanged
  from the second.** A text colour must stay a colour, and a darkening of nothing is nothing.
- **The first kit is not touched.** Its copy stays as it is; the overview row of the second kit's
  tag names the new home.
- **The agreement is a spec subdomain of the utils package.** The package has no spec directory,
  and the guard needs one for a behaviour change.

## What is left unclear

- Nothing.
