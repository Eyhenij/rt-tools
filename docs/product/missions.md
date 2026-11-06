# The missions of the products

**Status: draft, not in force,** except where a section says the owner accepted it. A session wrote
the rest, and until the owner accepts them the role `product-strategist` reads them as a question to
the owner, not as a norm.

A product here is what a person installs or opens. A mission says what the person at the end gets,
not what the developer calls or what the code holds. It does not list features. Once accepted, work
is judged against it: a milestone of an epic that serves no mission here is a finding of the role.

The owner sets the missions. A session proposes a wording from its analysis of the project and waits
for approval; it does not set or change one on its own: a mission that moves to fit the work checks
nothing.

## The second kit

`@rt-tools/ui-kit-v2`. Accepted by the owner on 6 November 2026.

- **Mission:** the person behind the screen gets a clear, whole and convenient interface, and the
  team gets it fast, without making again the decisions already made. Any screen built from the kit
  looks and works like a considered product, even when one developer built it without a designer.
- **It is not:** a kit tied to the look of one application, or a home for screens with subject logic.

## The first kit

`@rt-tools/ui-kit`.

- **Mission:** people who use an application on this kit keep a working interface until that
  application moves to the second kit.
- **It is not:** a kit for new applications, or a place for new components.

## The rules package

`@rt-tools/agent-kit`. Accepted by the owner on 6 November 2026.

- **Mission:** a person says what they want and gets a working result that matches their words,
  without watching over the agent, at any size of project. A mistake corrected once does not come
  back in any of their projects.
- **It is not:** a collection of advice, or an installer of files.

## The foundation

`@rt-tools/core`, `@rt-tools/store` and `@rt-tools/utils`.

- **Mission:** applications behave the same in what nobody sees, because that code exists once and a
  fix reaches all of them.
- **It is not:** a collection of functions for every case: what one consumer needs stays with them.

## The intake

`apps/message-bus` and `apps/message-bus-admin`.

- **Mission:** the owner of the rules sees what really goes wrong in each project, and every report
  gets an answer about what became of it.
- **It is not:** a general message bus, or the chat service.

## The entry module

The `@rt-tools/auth-*` packages and `apps/auth-example-admin`.

- **Mission:** a person signs in safely and the same way in every application, and a new application
  has working sign-in and rights from its first day.
- **It is not:** a directory of organisations, or a base for custom Keycloak extensions.

## The CMS

The `@rt-tools/cms-*` packages.

- **Mission:** the person who runs a site publishes and changes its pages and articles without a
  developer.
- **It is not:** a content storage, or a finished site.

## The chat with the visitors

`apps/chat-widget`, `apps/chat-talks-embed` and `apps/chat-talks-page`.

- **Mission:** a visitor asks a question on a site and gets an answer from a person, and nothing is
  lost on the way.
- **It is not:** an answering bot, calls or a general messenger.
