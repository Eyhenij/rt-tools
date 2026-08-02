# [0.1.0](https://github.com/nickmdf/rt-tools/compare/rt-utils@0.0.9...rt-utils@0.1.0) (2026-08-02)

### Code Refactoring

- **rt:utils:** strip the Angular-bound surface out of the package ([f067de1](https://github.com/nickmdf/rt-tools/commit/f067de1cf1fa16f2b743ac0b0b735879e6b5e20c)), closes [#220](https://github.com/nickmdf/rt-tools/issues/220)

### BREAKING CHANGES

- **rt:utils:** directives, pipes, validators, BreakpointService,
  DeviceDetectorService, Breakpoints, NAVIGATOR, OVERLAY_POSITIONS, POSITION_ENUM,
  provideRtUtils and isHTMLElement no longer ship from @rt-tools/utils. They move
  to @rt-tools/core.

### BREAKING CHANGES

- **rt:utils:** the package no longer ships anything that needs Angular. Six directives, ten pipes, both validators, `BreakpointService`, `DeviceDetectorService`, `Breakpoints`, `IBreakpoints`, `NAVIGATOR`, `OVERLAY_POSITIONS`, `POSITION_ENUM`, `provideRtUtils` and `isHTMLElement` move to `@rt-tools/core` — import them from there. No re-export shim is provided: one would put Angular back into this package's import graph, which is the whole point of the split.
- **rt:utils:** `@angular/common`, `@angular/core`, `@angular/forms`, `@angular/cdk`, `@angular/platform-browser`, `rxjs` and `@rt-tools/core` are gone from the dependency lists. The package now depends on `tslib` alone and declares no peers.

### Features

- **rt:utils:** `isNil` and `Nullable` now live here rather than in `@rt-tools/core`, so the pure functions built on them no longer reach into an Angular package. `@rt-tools/core` no longer exports them at all — import them from `@rt-tools/utils`.
- **rt:utils:** `isEmail` no longer builds a `FormControl` to reach `Validators.email`; it tests the same pattern directly and exports it as `EMAIL_REGEXP`. Verdicts are unchanged, including that an empty value counts as valid — a spec now pins that.
- **rt:utils:** the package now ships both CommonJS and ESM behind an `exports` map, so a consumer compiling to CommonJS can `require()` it. It previously shipped ESM-only with `"type": "module"`, which no amount of removing Angular would have made loadable there. `main` points at the CommonJS entry, `module` and `types` at the ESM one.

## [0.0.9](https://github.com/nickmdf/rt-tools/compare/rt-utils@0.0.7...rt-utils@0.0.9) (2026-07-28)

### Bug Fixes

- **rt:utils:** stop pulling `@angular/material/tooltip` into the bundle — the package now imports only what its peer list declares, so consumers without Angular Material can build again

### BREAKING CHANGES

- **rt:utils:** `RtHideTooltipDirective` no longer ships from `@rt-tools/utils`; it moved to `@rt-tools/ui-kit`, where Material is already a peer dependency. Import it from `@rt-tools/ui-kit` instead

## [0.0.7](https://github.com/nickmdf/rt-tools/compare/rt-utils@0.0.6...rt-utils@0.0.7) (2026-07-09)

## 0.0.6 (2026-04-26)

## [0.0.5](https://github.com/nickmdf/rt-tools/compare/0.1.81...0.0.5) (2026-01-08)

## [0.0.4](https://github.com/nickmdf/rt-tools/compare/0.1.81...0.0.4) (2026-01-02)

## [0.0.3](https://github.com/nickmdf/rt-tools/compare/0.1.81...0.0.3) (2026-01-02)

## [0.0.2](https://github.com/nickmdf/rt-tools/compare/0.1.81...0.0.2) (2026-01-02)

### Bug Fixes

- change type and handler of table row event ([b3c4c30](https://github.com/nickmdf/rt-tools/commit/b3c4c30ef3cf7000daa3523966b0a7b40f7f69b2))
- change type of table row event ([8b73a9e](https://github.com/nickmdf/rt-tools/commit/8b73a9e9524ba0eb72d76a6373cc289d0ae7b227))
- column base cell copyable component ([5d44251](https://github.com/nickmdf/rt-tools/commit/5d44251ec05a9771a1c128f721ee0b5877d3e8e6))
- fix action height based on local debug in web-store browser console ([75fd911](https://github.com/nickmdf/rt-tools/commit/75fd911d7dd2b60ba2682c521cc1a1f4a62d56ef))
- fix position copy-btn logic ([e84ed2e](https://github.com/nickmdf/rt-tools/commit/e84ed2e94e7e91f521010e940454b28f7a055c46))
- fix scrollable host height for mobile devices ([7c77513](https://github.com/nickmdf/rt-tools/commit/7c77513224fb02c800e48ebf08cdb65a7d623942))
- fix table pagination ([08d9a12](https://github.com/nickmdf/rt-tools/commit/08d9a12b04c205053848e08509730cde95dea540))
- fix table row actions position for Apple devices ([ea7c17b](https://github.com/nickmdf/rt-tools/commit/ea7c17bea54b7abe31f281c2c6ca5fae3ee787c5))
- fix table selector visible and propagation ([15308d1](https://github.com/nickmdf/rt-tools/commit/15308d1f4408ead99f730561952ca2edd7e793b1))
- placeholder and button add roles ([fe1bde4](https://github.com/nickmdf/rt-tools/commit/fe1bde47f7b2007e685d8275f2538cbc31f9fd48))
- row table actions position ([9cd18c0](https://github.com/nickmdf/rt-tools/commit/9cd18c0b37560a443c004bc4fc0606f552839a1f))
- rtIconOutlined directive ([d62608e](https://github.com/nickmdf/rt-tools/commit/d62608e160cf5fddaae725c63cbce58e6c3068d2))
- table row actions height ([cace356](https://github.com/nickmdf/rt-tools/commit/cace356c78c1465cbd1890126c3f103d6ba688da))
- use areArraysEqualUnordered in rtui-dynamic-selector for pure comparison ([15878c4](https://github.com/nickmdf/rt-tools/commit/15878c4524bd652a9ea18f884bf0027b1fb0ea91))

### Features

- add checks in pipe ([c9785d1](https://github.com/nickmdf/rt-tools/commit/c9785d1b065fd9b80dad3fe617d35c09310e6e1d))
- add copyBtnAlign parameter in props of table-base-cell ([ff02209](https://github.com/nickmdf/rt-tools/commit/ff0220986c0a91555afae8a31e09a813ca7e12ce))
- add default values fields to type cast helpers ([908a83f](https://github.com/nickmdf/rt-tools/commit/908a83f7d65c451675f0f848de820cc48bf8fb99))
- add edit field option for dynamic input ([56bc83e](https://github.com/nickmdf/rt-tools/commit/56bc83e7781557a96fe99cd4626ba3c2db77ea92))
- add has property in chain function ([7d9f4fd](https://github.com/nickmdf/rt-tools/commit/7d9f4fd1d8e550ae2aa2d763145ea85d2ac2fa0a))
- add has property in chain function export ([802365c](https://github.com/nickmdf/rt-tools/commit/802365cb4076050148a532d8e161f2818ec7c3e6))
- add isFooterShown flag in aside container ([b2d31ba](https://github.com/nickmdf/rt-tools/commit/b2d31ba9cab50a928c330f6163c485cb3be02e9d))
- add optimization to image cropper ([e83f0ad](https://github.com/nickmdf/rt-tools/commit/e83f0addaa3c1ab2a96ea7596612cea55b0d326b))
- add save emitter ([27c510c](https://github.com/nickmdf/rt-tools/commit/27c510c9d9898cfbce4d36534f5ed012fd6ff959))
- add table border width vars ([2e61f34](https://github.com/nickmdf/rt-tools/commit/2e61f34228dd9c27ca07c9966c16c68f066eb5de))
- add table filter header row ([2085dcc](https://github.com/nickmdf/rt-tools/commit/2085dcc664cf03224bc85c416b9d8a8b5abb3550))
- extend table interface ([bed9882](https://github.com/nickmdf/rt-tools/commit/bed98822e59224d60a1b91b58b64eb7c984b914f))
- implement button component ([74233d0](https://github.com/nickmdf/rt-tools/commit/74233d09814586eea565852c640e708a6e19ef89))
- implement multi-button component ([38e9a97](https://github.com/nickmdf/rt-tools/commit/38e9a97231e9c1fcbd2e2991bb0f370e21c79432))
- implement table row click directive and table stop row click directive ([ca576e6](https://github.com/nickmdf/rt-tools/commit/ca576e6f63604ccd6d377c9e97feabfcb3f57ef6))
- import debounce fn ([d912960](https://github.com/nickmdf/rt-tools/commit/d912960c7288b5254ac70cc5aad514faec9ad831))
- **rt:store:** add redux devtools integration ([e5f6081](https://github.com/nickmdf/rt-tools/commit/e5f6081ffe0f3b64c5c97d8f5a7acd757a6a42f7))
- **rt:ui-kit:** implement action bar ([69ac1a0](https://github.com/nickmdf/rt-tools/commit/69ac1a0afb37d090a9fe11e3d662d8a7437d049b))
- **rt:ui-kit:** implement checkbox ([f12e94c](https://github.com/nickmdf/rt-tools/commit/f12e94c7cd735f1931bfb59a4efbdd346886b412))

### Reverts

- Revert "Refactor/use input types (#135)" ([4de980a](https://github.com/nickmdf/rt-tools/commit/4de980ade8e805e596f74a15f6752c6a837d7ffe)), closes [#135](https://github.com/nickmdf/rt-tools/issues/135)

# Changelog

All notable changes to this project will be documented in this file.

## [0.0.1] - Initial Release

### Added

- Utility functions (isEqual, isNumber, isString, isEmpty, debounce, etc.)
- Pipes (BreakStringPipe, SanitizePipe, EqualPipe, TernaryPipe, etc.)
- Directives (RtIconOutlinedDirective, ScrollToElementDirective, etc.)
- Services (BreakpointService, DeviceDetectorService)
- Validators (comparison, arrays-not-empty)
- Helper classes (TypeCastHelper, BaseMapper)
- Constants and enums
- `provideRtUtils()` function for dependency injection
