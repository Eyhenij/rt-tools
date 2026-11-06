# The missions of the products

**Status: draft, not in force.** A session wrote this text, and the owner has not accepted it. Until
they do, the role `product-strategist` reads it as a question to the owner, not as a norm.

A product here is what a person installs or opens. A mission says for whom the product exists and what
changes for them; it does not list features. Once accepted, work is judged against it: a milestone of
an epic that serves no mission here is a finding of the role.

The owner writes the missions. A session proposes a change and does not make one on its own: a mission
that moves to fit the work checks nothing.

## The rules package

`@rt-tools/agent-kit`, for a repository where an agent writes the code.

- **Mission:** the agent works in any repository by the same checked rules from the first command, and
  what one repository learned reaches the others.
- **It is not:** a rule set for one repository, or a replacement for the reviewer.

## The first kit

`@rt-tools/ui-kit`, for applications already built on it.

- **Mission:** existing applications keep working and get fixes without rewriting a screen.
- **It is not:** a place for a new look: that is the second kit.

## The second kit

`@rt-tools/ui-kit-v2`, for a team that builds an Angular interface.

- **Mission:** a new application gets a whole accessible interface from one set of components and
  tokens, without writing styles of its own.
- **It is not:** an application framework, or a kit tied to the look of one product.

## The foundation

`@rt-tools/core`, `@rt-tools/store` and `@rt-tools/utils`, for whoever writes an Angular application
or a kit.

- **Mission:** the state, the types and the helpers every application writes again are written once
  and tested once.
- **It is not:** a framework of its own, or a home for what only one kit needs.

## The intake

`apps/message-bus` and `apps/message-bus-admin`, for the owner of the rules package.

- **Mission:** what repositories report about the rules reaches one place, gets read and gets an
  answer, so the rules change by evidence.
- **It is not:** a public service, or a work queue of its own.

## The entry module

The `@rt-tools/auth-*` packages and `apps/auth-example-admin`, for an admin application.

- **Mission:** an admin application gets one sign-in and rights by installing packages, without
  writing its own.
- **It is not:** a sign-in for public sites, or a replacement for Keycloak.

## The CMS

The `@rt-tools/cms-*` packages, for an application that keeps pages and articles.

- **Mission:** an application that keeps pages and articles installs its content handling instead of
  writing it again.
- **It is not:** a hosted content service, or a page builder for visitors.

## The chat with the visitors

`apps/chat-widget`, `apps/chat-talks-embed` and `apps/chat-talks-page`, for a public site and the
person who answers it.

- **Mission:** a visitor writes on a site and gets an answer from the admin application, with nothing
  lost on the way.
- **It is not:** a support desk, or a marketing channel.
