# Grill

The work is begun from no cargo record.

## The owner request

> Делай эпик дальше

The epic plan `docs/plans/ai-chat-blocks.md`, row 7, names the next task: RT-3339 — the card of a
link to a page with the outcome of opening it. The task card, verbatim:

> ## Что не так
>
> Ассистент открывает страницу приложения вызовом инструмента и пишет об этом текстом. Пользователь не видит, открылась ли страница, и не может открыть её ещё раз или в новой вкладке.
>
> ## Что нужно от кита
>
> Блок `link` для `rt-ai-chat`:
>
> - карточка: название страницы, раздел меню, иконка;
> - действия `Open` и `Open in new tab`; кит отдаёт событие, навигацию делает приложение;
> - состояние: `opened`, `failed` с причиной, `pending`.
>
> ## Готово, когда
>
> Карточка показывает три состояния, кнопки отдают события с адресом страницы. В витрине есть история на каждое состояние.

## What the tree already has

- **The wiring of the kit's own block types** — `rt-ai-chat-blocks.logic.ts`: `OWN_TYPES`, one data
  function per type returning the data or `null` (then the block is drawn as unsupported),
  `toBlockViews` and `blockText` as if-chains; `rt-ai-chat.model.ts` holds the block and view
  unions; `rt-ai-chat-blocks.component.html` has a `@case` per kind. The closest sample is the
  `kpi` block of RT-3338: `blocks/kpi/`, the lenient parser `lib/util/kpi-data.ts`, the schema
  `lib/util/kpi.schema.ts`.
- **No block emits anything today.** `rt-ai-chat` leaves by outputs only (`send`, `stop`, `retry`,
  `feedbackChange`, `controlPicked` …); `feedbackChange` travels answer → chat, and the chat adds
  `messageId`. A block drawn by an application renderer through `*ngComponentOutlet` gets inputs
  only.
- **Ready kit parts for the card:** `rt-card`, the `rtButton` directive (`theme`, `appearance`,
  `size`, `loading`, `icon`), `rt-icon-button`, `rt-icon` (the set has `external-link`, `link`,
  `arrow-up-right`), `rt-tag` (status with `severity`), `rt-message` (a reason line),
  `rt-spinner`. `rt-file-card` and `download-link` are precedents of a card that emits and does
  not act.
- **The pending state has a precedent:** the chart block's `pending` field and its view union
  `pending | invalid{reason} | ready` (`ai-chat-chart.view.ts:rtAiChatChartState`).
- **The protocol has no open-page tool and no per-call outcome** — `IAiChatToolCall` is
  `{id, name, arguments}`; the RT-3335 finding says the protocol does not mark the end of a tool
  call, so the application, not the protocol, tells the block its state.
- **The epic plan** keeps navigation out of the kit: «кит отдаёт событие, действие делает
  приложение». Link is not part of milestone G.
- **The epic findings that apply:** a mockup draws a frame for every width the block meets; story
  wrappers keep their template in `.html`; the plan of a chat block names a chat story in every
  mode the card names (full screen gives a 640 reading column); the danger colour on a dark card
  reads at 3.2 : 1, which touches the `failed` state.
- **The spec sample** is `docs/specs/ui-kit-v2/ai-chat-kpi/`; the next free scenario number is
  SC-UKV-1486.

## What the rules already say

- The rule `kit-approval`: a Figma mockup and the owner's approval come before the code; the
  showcase matches the mockup by numbers and is approved. By the owner's word in RT-3338 the
  components are fitted to the mockup, not the mockup to the components.
- The rule `reuse-first`: the card is built on `rt-card`, the buttons on `rtButton`, the status
  on `rt-tag`.
- The pattern `task-flow-start`: the owner took the recommended option twice running at the end
  of RT-3338, so the six questions close by assumption and go below as decisions.

## Questions and answers

None asked: see the decisions.

## Decisions

The six questions, closed by assumption:

- **The task changes behaviour** — the chat answer draws a new block type and gets a new output.
  A product agreement is written in `docs/specs/ui-kit-v2/proposed/ai-chat-link/` after the mockup
  is approved, as in RT-3338.
- **No law or rule is edited** — the block follows the rules the KPI block followed.
- **One task** — the block, its data function, its schema, its copy line, the new chat output and
  its stories roll back together.
- **Not part of the task** — navigation itself and a navigate tool in the protocol; the section
  and the grid of a composed answer (RT-3342); the sources block (RT-3340).
- **Closed when** — the card's sign: the card shows `pending`, `opened` and `failed` with a reason;
  `Open` and `Open in new tab` emit an event with the page address; the showcase has a story per
  state; the showcase matches the approved mockup by numbers and is approved by the owner.
- **Sample** — the wiring of the `kpi` block; the state union of the chart block.

Design decisions taken by assumption:

- **The state comes in the block, not from the kit** — `state: 'pending' | 'opened' | 'failed'`
  and `reason` for `failed`; the application writes it, since the protocol has no outcome of a
  call. An unknown or absent state is `opened`.
- **The event leaves by an output of `rt-ai-chat`** — `linkOpen` with `messageId`, the page
  address and `newTab`, travelling block → blocks → answer → chat like `feedbackChange`. The kit
  does not navigate and draws no `href`.
- **A block without a non-empty title or address is not drawn as a card** — it falls to the
  unsupported placeholder, like a malformed table.
- **The kit exports a JSON schema of the block** — as for the chart, the table and the KPI.
- **The answer copy writes the card as one line** — the title, the section and the address.
- **The labels `Open` and `Open in new tab` are kit labels in eight languages.**
