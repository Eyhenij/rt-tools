# Grill

Task RT-2578 · the PR into the epic branch RT-2575

## The owner request

> я вмержил https://github.com/Eyhenij/rt-tools/pull/2559, подтягивай свежий main и чисти вмерженные ветки как локально так и в ремоуте, выпускай итоговые пакеты auth и затем мигрируй логин из message bus на новый auth

## What the tree already has

- The bus server and the admin panel sign in through Keycloak since RT-2576. The rights of a person
  come from the token: they are the client roles of the bus client.
- The people and roles screens of the admin panel still edit the bus tables `account`, `role`,
  `account_permission` and `session`. Since RT-2576 none of them opens a sign-in.
- The server domain `accounts` serves those screens: reading, creating, a new password, disabling,
  the roles and the per-person rights. Its utilities also give `accountOf`, which the chat and the
  cargo close read the signed-in person by.
- A chat operator names its person by the column `accountId`. On the stand it already holds the
  Keycloak id of the person; in production it holds the id of a bus account.
- The end-to-end suite has three specs of these screens: `people-list`, `people-panel`, `roles`.
- The specs of these screens are the subdomains `people-list`, `people-editing` and `roles-page`.

## What the rules already say

- `docs/specs/auth/spec.md`: the people and their rights live in Keycloak, and the admin of an
  application shows no screen of its own for them.
- The epic plan: the people and roles screens give way to the Keycloak console.
- The access law keeps the article about the preset and the overrides; it cannot hold under
  Keycloak, and that went to the owner as text, not as an edit of the law.

## Questions and answers

**How do the production chat operators move to Keycloak people?** Not asked: the answer follows
from the epic. The import of people (RT-2579) creates every person in Keycloak and knows both ids,
so it rewrites the operator column. Until then the column keeps what it holds.

## Decisions

- **The people and roles screens, their server operations and the four tables leave.** The
  Keycloak console replaces them. Rejected: a read-only list of people in the admin, because it would
  read Keycloak through a service client the admin does not need otherwise.
- **The operator column is named after the Keycloak person.** It holds the Keycloak id from now on.
  Rejected: keeping the name `accountId`, because it names a table that no longer exists.
- **`accountOf` stays where the chat and the cargo close find it, without the accounts domain.** The
  signed-in person is read from the token, and that is the access domain's business.

## What is left unclear

- The production import of the operator ids belongs to RT-2579 and waits for the owner's addresses.

## Decisions along the way

- **The branch stands on the local epic branch with main merged in.** The epic branch could not be
  sent: the frames of main lack the Keycloak name in the header, and the push gate runs the suite.
  The frames are taken anew by the first step here, and the merge reaches the epic branch with this
  task. Affected stage of the plan: 1.
- **The refusal codes of people and roles left with their operations.** Nothing throws them any
  more, and the refusal spec lists only codes the intake answers with.
- **The migration drops the four tables in this task.** The export of RT-2579 reads production
  before the deploy of the epic; this went into the epic plan.
