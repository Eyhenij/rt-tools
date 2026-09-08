# Scenarios — the actions at a reply of a correspondence

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through:
the titles of the tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-73 — an action of one's own at a reply is declared by a template

Given the consumer declared a template of the actions at a reply
When the thread is drawn
Then the reply has a point of the actions, and its menu holds the items of the consumer with the reply
itself as the context

Covered: `projects/ui-kit-v2/src/lib/components/chat/rt-chat-message-actions.directive.spec.ts`.

### SC-UKV-74 — the template is not declared: the markup of the reply is the former one

Given there is no template of the actions at a reply
When the thread is drawn
Then there is no point of the actions at the reply at all, and the pinpoint actions stayed in place

Covered: `projects/ui-kit-v2/src/lib/components/chat/rt-chat-message-actions.directive.spec.ts`.

### SC-UKV-75 — the predicate gave falsehood: there is no point of the actions at the reply

Given the template is declared, and the sign of the actions gives falsehood at this reply
When the thread is drawn
Then it has no point of the actions, and the reply at which the sign gave truth has one

Covered: `projects/ui-kit-v2/src/lib/components/chat/rt-chat-message-actions.logic.spec.ts`,
`projects/ui-kit-v2/src/lib/components/chat/rt-chat.component.spec.ts`.

### SC-UKV-76 — the sign is not set: the point of the actions is shown

Given the template is declared, and the consumer named no sign of the actions
When the thread is drawn
Then every reply has a point of the actions: a screen that gates nothing shows it the same way a row
of the table does

Covered: `projects/ui-kit-v2/src/lib/components/chat/rt-chat-message-actions.logic.spec.ts`.
