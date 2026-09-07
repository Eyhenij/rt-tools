## The ports and stands of this tree

A section of this tree: there is no site and no rendering server here, and there are two stands —
the showcase of the component set and the stand of the end-to-end suite with its own seeded
database.

| Role                  | Port  | Raised by                              |
| --------------------- | ----- | -------------------------------------- |
| the showcase          | 6006  | `pnpm run storybook`                   |
| the built showcase    | 6007  | `pnpm run build-storybook` and serving  |
| the stand receiver    | 3310  | `pnpm run serve:stand`                 |
| the stand admin panel | 4310  | by the same call                       |
| the dev receiver      | 3000  | `pnpm run serve:api`                   |
| the dev admin panel   | 4200  | `pnpm run serve:admin`                 |
| the dev database      | 55432 | `pnpm run serve:db`                    |

The ports of the end-to-end stand are overridden by the variables `E2E_API_PORT` and
`E2E_ADMIN_PORT` — they are declared in `apps/message-bus-admin-e2e/stand/stand.mjs`. The stand
takes no working ports: on it one looks at what the working database does not have.

Sorting out an occupied port, telling a built artefact from a dev server and the rule that a
second instance is not raised hold here in full — and they are what one uses when the showcase
answers with the wrong thing.

## Why there is no nginx stand here

A section of this tree: none of the applications here has a proxy. The admin panel goes to the
receiver directly, proxying `/api` to its port by its own dev config, and the showcase is static
without a server. No conclusions about caching, redirects and headers are drawn on these stands:
there is nothing to draw them from.
