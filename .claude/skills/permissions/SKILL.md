---
name: permissions
kind: rule
law: access
description: A rule under the "Law on access". Take it when creating or editing a Connect procedure, a sign-in interceptor, an admin panel route guard and the menu declaration. It names the four kinds of access, the decorators and the gating of sections. Ready-made code — the pattern permissions-procedure.
---

# Access — how it is arranged here

A rule under the law `docs/constitution/application/access.md`. Cold part: `pitfalls.md` — the whole
text, every section and article with its reasons.

## How the law applies here

- **Every procedure declares its access by a decorator, and there is exactly one declaration.**
- **There are four kinds of access: by a right, to any signed-in person, public and public with a
  read of the sign-in.**
- **A user's rights are the preset's rights with their overrides applied over them.**
- **A person has one role per ownership, and the storage holds that.**
- **A right the role says nothing about counts as not given.**
- **A signed-in person's rights are read on every call rather than taken from the issued sign-in.**
- **An account that no longer exists opens no calls that require a sign-in.**
- **The counter and the advertising signals are switched on by the guest's answer, not by the
  presence of a key in the settings.**
- **A public procedure that creates a record is closed by a rate limiter as well.**
- **A request without a sign-in is refused as unauthenticated, and a sign-in without a right as
  permission denied.**
- **The right is checked by an interceptor before the procedure body.**
- **Being public is declared with a reason.**
- **A menu item and a section address are closed by one declaration.**
- **Until the rights are received the admin panel hides nothing.**

## Pitfalls

- **A procedure the interceptor knows nothing about is refused as permission denied rather than let
  through.**
- **The guard stands on the child routes of the protected group, not on the group itself:** a
  group's guard runs once per page load and does not see moves between sections.
- **The rights arrive in the profile's answer already inside the protected group**, so the guard
  waits for the admin panel to start.

## Names and techniques

- A right is `resource:action`; decorators are named in pattern permissions-procedure.
- Rights are written on the membership, not the account; ownerships do not add up.
- The limiter counts by one shared client key; a read-only public procedure needs none.
- Consent is a pair of booleans; anything else reads as refusal; own stats need none.
- The decorators live in the auth domain's `util`, not next to the interceptor.
