# What it is carried out by — the actions at a reply of a correspondence

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The consumer declares its own action at a reply by a template, not by an edit of the kit.** — `projects/ui-kit-v2/src/lib/components/chat/rt-chat-message-actions.directive.ts:RtChatMessageActionsDirective`; scenario `SC-UKV-73`
- **The visibility of the point of the actions is held by the predicate of the consumer, not by a count of the drawn items.** — `projects/ui-kit-v2/src/lib/components/chat/rt-chat-message-actions.pipe.ts:RtChatMessageHasActionsPipe`; scenario `SC-UKV-75`
- **The predicate is not set — the point of the actions is shown.** — `projects/ui-kit-v2/src/lib/components/chat/rt-chat-message-actions.logic.ts:messageHasAvailableActions`; scenario `SC-UKV-76`
- **The template is not declared — the markup of the reply is the former one.** — `projects/ui-kit-v2/src/lib/components/chat/rt-chat.component.ts:messageActions` — the output of the point of the actions stands under the condition of a caught template; scenario `SC-UKV-74`
- **The pinpoint actions stay in place.** — `projects/ui-kit-v2/src/lib/components/chat/rt-chat.component.ts:deleteMessage` — the deleting, the repeat and the downloading stayed as outputs of the kit's own; scenario `SC-UKV-74`
- **An action of the consumer is not described by the model of a reply.** — `projects/ui-kit-v2/src/lib/components/chat/rt-chat.model.ts:MessageActionsPredicate` — the model holds the sign, not the action; scenario `SC-UKV-73`
