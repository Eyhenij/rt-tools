## The ports and stands of this tree

A section of this tree: there is no site and no rendering server here. There are three kinds of
stands: the showcases of the two kits, the stand of the admin panel's end-to-end suite with its own
seeded database, and the stand of the entry example. Both end-to-end stands sign in through one
identity server.

| Role                  | Port  | Raised by                              |
| --------------------- | ----- | -------------------------------------- |
| the first kit's showcase  | 6006  | `pnpm run storybook:ui-kit-v1`     |
| the second kit's showcase | 6007  | `pnpm run storybook:ui-kit-v2`     |
| the stand receiver    | 3310  | `pnpm run serve:stand`                 |
| the stand admin panel | 4310  | by the same call                       |
| the dev receiver      | 3000  | `pnpm run serve:api`                   |
| the dev admin panel   | 4200  | `pnpm run serve:admin`                 |
| the dev database      | 55432 | `pnpm run serve:db`                    |
| the entry example's receiver    | 3410  | the entry suite's stand, `apps/auth-example-e2e/stand/up.mjs` |
| the entry example's admin panel | 4410  | by the same call                   |
| the identity server, shared by both stands and the dev receiver | 58080 | `pnpm run serve:auth`; both stand scripts call it |

The ports of the end-to-end stand are overridden by the variables `E2E_API_PORT` and
`E2E_ADMIN_PORT` — they are declared in `apps/message-bus-admin-e2e/stand/stand.mjs`. The stand
takes no working ports: on it one looks at what the working database does not have.

Sorting out an occupied port, telling a built artefact from a dev server and the rule that a
second instance is not raised hold here in full — and they are what one uses when the showcase
answers with the wrong thing.

## Why there is no nginx stand here

A section of this tree: the production proxy is Caddy (`deploy/Caddyfile`), and no stand runs it.
On a stand the admin panel goes to the receiver directly, forwarding `/api` to its port, and the
showcases are served by their own dev server and have no proxy. No conclusions about caching, redirects and headers are drawn
on these stands: there is nothing to draw them from.
