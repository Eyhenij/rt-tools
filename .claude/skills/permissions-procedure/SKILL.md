---
name: permissions-procedure
kind: pattern
rule: permissions
description: A pattern of the rule permissions. Take it when creating a Connect procedure and when closing an admin panel section: ready-made access decorators, the refusal without a sign-in and without a right, a menu item with a right and a flag. Not for how the menu is arranged — that is navigation.
---

# Declaring access

A pattern of the rule `permissions`. What must be true at that is the law
`docs/constitution/application/access.md`.

## When to use

- A Connect procedure is being created.
- An admin panel section is closed by a right.
- A procedure must answer a guest.

## The decorator on the procedure class

There is exactly one declaration; without it the application does not come up:

```typescript
@Injectable()
@ConnectProcedure()
@RequiresPermission('chat:manage')
export class LinkBookingProcedure implements IConnectProcedure<typeof ChatService.method.linkBooking> {
    public readonly method: typeof ChatService.method.linkBooking = ChatService.method.linkBooking;
}
```

| Decorator                                     | Who it is open to                                            |
| --------------------------------------------- | ------------------------------------------------------------ |
| `@RequiresPermission('<resource>:<action>')`  | a signed-in person with that right                           |
| `@RequiresAuth('<reason>')`                   | any signed-in person; that is how the profile and the language choice live |
| `@PublicProcedure('<reason>')`                | a guest without a sign-in                                    |
| `@OptionalAuthProcedure('<reason>')`          | a guest, but the token is read if there is one               |

The argument is a reason for the reader of the code. It goes neither into the answer nor into the
log.

## The refusal

The interceptor answers before the procedure body:

- there is no sign-in where a sign-in is needed — `Code.Unauthenticated`;
- there is a sign-in, there is no right — `Code.PermissionDenied`;
- a procedure the interceptor knows nothing about — permission denied as well, not a pass.

The handler makes no decision about admission.

## An admin panel section

The menu item and the address are closed by one declaration — the one the header takes the labels
and the addresses from, and the guard the rights. Where it lies in this tree is named by
`implementation.md` next to the rule: a path written here lies in the first tree that keeps its
admin panel differently. No second declaration of this link is started.

The gating has two layers: the user's right and the section flag. An item with a flag is declared
without rights and without an address — a right opens a screen, and there is no screen. Once a
screen appears, the flag is removed and the rights are added.

## Frequent misses

- Two access declarations on one procedure: the application will not come up, and this will be
  seen only at startup.
- A right check inside `handle`: the right is checked before the body.
- One's own declaration of rights next to the routes: it will diverge from the menu declaration,
  and the result is "the item is not visible, and the page opens".
- A guard hung on the protected group whole: it runs once per page load and does not see moves
  between sections.
- A wait for the rights that falls on a refused request: with unknown rights nothing is closed,
  and an empty header leaves the owner no way out.
