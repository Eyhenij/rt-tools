# Plan

**Task:** RT-2594 · **Branch:** RT-2594-cms-angular
**Spec:** `docs/specs/cms/angular/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                           |
| ----- | ------------------------------------------------------------------------------- |
| Specs | `docs/specs/cms/`                                                               |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md` |
| Rules | none edited                                                                     |
| Code  | `projects/cms-angular/`, workspace files                                        |

## What counts as done

- `@rt-tools/cms-angular` builds with ng-packagr, with the entry points `admin` and `site`.
- The main entry gives the editor model, the paste cleaning, the block registry, the labels and the
  Connect clients; `admin` gives the screens and the routes of pages, types, tags, redirects and the
  media library; `site` gives the page renderer and the page data.
- Every text is an English label the application can translate.
- Its tests pass, and its spec binds every rule.

## Stages

### 1. The package and the editor model

- **Steps:**
    1. Create `projects/cms-angular` after the auth Angular package and register it
    2. Carry over the editor model, the form decisions, the paste cleaning and the labels with their tests
- **Readiness sign:** the package builds and its tests are green
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/cms-angular` — "Successfully ran targets"

### 2. The admin

- **Steps:**
    1. Carry over the clients, the stores and the configuration tokens
    2. Carry over the block editor and the admin components
    3. Carry over the screens and the routes of the content and the media library
- **Readiness sign:** the `admin` entry builds and its tests are green
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/cms-angular` — "Successfully ran targets"

### 3. The site

- **Steps:**
    1. Carry over the block renderer, the page data and the redirect resolver
- **Readiness sign:** the `site` entry builds and its tests are green
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/cms-angular` — "Successfully ran targets"

### 4. The spec and the checks

- **Steps:**
    1. Write the spec, the scenarios and the bindings, and the README
    2. Run the tree checks
- **Readiness sign:** the spec check names no divergence in `cms`
- **Verified by:** `npm run check:specs` — exit code 0

## What this work does not do

- The release — RT-2595.
- Switching an application to the packages — a task of that application.
