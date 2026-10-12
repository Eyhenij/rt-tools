# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- `pnpm outdated -r` on 2026-10-12 lists the build, lint, test and showcase tooling behind by minor
  and patch versions: nx 23.3, eslint 10.12 with its plugins, typescript-eslint 8.71, prettier
  3.9.10, stylelint 17.16, jest 30.5.2, vite 8.3.4, storybook 10.6.1, Playwright 1.64 and more.
- The peers of ng-packagr 22.2.4, analogjs 2.8, nx 23.3 and jest-preset-angular 17.0.2 accept
  Angular 22.1, so this task does not wait for the Angular one.
- The showcase runner keeps its own Jest chain on 30.4 by overrides in `pnpm-workspace.yaml`.

## Decisions

- **The styling carriers stay out:** sass, postcss, autoprefixer and simple-icons have tasks of
  their own (RT-2770, RT-2771).
- **The overrides of the runner's Jest chain stay** while the runner still loads its config through
  `module.register()`; they are revisited after the update, not dropped blind.
