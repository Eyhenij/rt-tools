# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 2 — Hashed file names of the theme
- **Done:** grill and plan
- **Next step:** `outputHashing` in the `build-app` target
- **Uncommitted:** the task folder
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [>] 1.1 `outputHashing: "all"` in the `build-app` target
- [ ] 1.2 The theme check takes the entry file name from the login page
- [ ] 1.3 A spec rule on hashed file names of the theme
- [ ] 2.1 Theme tests and linters
- [ ] 2.2 Folder taken apart, PR

## Decisions along the way

## Sessions

### 14.10.2026

- On production the registration page is blank: the browser takes `main.js` from its cache
  (`transferSize 0`), and the old file asks for `chunk-B0G_bQbC2.js`, which answers 404.
