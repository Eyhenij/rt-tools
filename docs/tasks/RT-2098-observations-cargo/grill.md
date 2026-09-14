# Grill

## The owner request

> новый эпик: я как пользователь приёмника message bus хочу видеть статистику использования правил в сессиях у приложений потребителей, хочу видеть какие скилы и какие правила вызываются и в каком количестве, задавай вопросы по grill-me по task flow чтобы не осталось пробелов

## What the tree already has

- **Sending side, package `agent-kit`.** `assets/hooks/skill-loaded.sh` writes `skill-load` with `res=<skill>` and a hashed session sign into `.claude/rt-kit/observations/<day>.jsonl` (via `observe.sh`). `src/lib/observations.ts` builds `ISummary`: `sessions`, `loads` (count per rule), `denials`, `kinds`, `guards`, `pushGate`, `unused`, `silentGuards`, `bytes`. Window: `DEFAULT_DAYS = 3`, files kept `KEEP_DAYS = 30`.
- **What leaves the tree.** `src/lib/shipment.ts:117 summaryCargo` — `loads` and `denials` go through `knownCounts(..., known)`: only names of package resources leave; the tree's own skills (`grill-me`, `rt-tools-storybook`, …) are dropped from the cargo. `ship` uses `DEFAULT_DAYS` (`src/bin/agent-kit.ts:332`) — the digest of a run covers the last three days.
- **Receiver.** `prisma/schema.prisma` — `MonthRecord { treeId, month, summary Json?, schema, ranAt }`, one per pair tree–month. `libs/message-bus-api/observations/data-access/src/lib/month-record.queries.ts:65` — `upsert`, `update: { summary }`: **the digest of the last run replaces the former one whole**. Spec `docs/specs/message-bus/intake/spec.md:155` says so and why: windows of runs overlap, adding up would overstate. So the stored month record is not a monthly total but the last three days — the current data cannot answer "how many per month".
- **Admin.** Section `libs/message-bus-admin/summaries/` already exists: list columns tree / month / sessions / ranAt (`month-record.columns.ts`), the details panel shows `summary` as plain text (`month-record.model.ts`). Sample for a list screen: rule `lists`, pattern `admin-lists-screen`, subdomain spec `docs/specs/message-bus/admin-list-page/`.
- **Spec boundary.** `docs/specs/message-bus/spec.md:141` "What is out of scope": _A digest over several trees and charts — the word of the owner: the lists are shown, and a digest is appointed when there are three trees._ This request changes that line.
- **Epic plans nearby.** `docs/plans/agent-kit-observations.md` (the feedback loop: observe → digest → ship → receiver), `docs/plans/message-bus.md` (receiver hardening; "creates no new capabilities"). No plan or task about usage statistics found.
- **Raw observation line** (`.claude/rt-kit/observations/<day>.jsonl`): `{"t","ev","res","kind"?,"sid","v"}`; `ev` ∈ `skill-load | gate-deny | guard-deny | push-gate`; `sid` is a cksum of the session id — counts sessions, names none. Session and time are lost by `summarize()`; the receiver has no notion of an agent session (`Session` in the schema is a person's login).
- **Rights.** The closed list of rights in the common lib (`summaries:read`, …) — a new section needs a right of its own. The menu declaration lives in the admin common container lib; the base of a list screen in the admin common core lib (`AdminListScreenBase`).
- **Intake validates fields, not content.** `SUMMARY_FIELDS` in the observations util lib; the e2e seed (`apps/message-bus-admin-e2e/stand/seed.mjs:280`) sends `loads: 512` and passes — the stored `summary` cannot be aggregated without validation.
- **Other owner's-word boundaries this request touches.** `docs/specs/agent-kit/observations/spec.md` out of scope: "Network telemetry and background sending", "Gathering observations from several machines into one place"; `docs/specs/message-bus/intake/spec.md:262` out of scope: "A sign of a run and protection from a repeated sending" — raw lines need dedup.
- **Cargo weight limit.** `CARGO_LIMIT` of the receiver app — 2mb per request.
- **Queue.** No open issue or plan about rule statistics (`gh issue list` filtered — empty).
- **Laws touched.** lists, observability, verifiability, entity-models, lib-imports, delivery (package publish + rollout).

## What the rules already say

- Rule `lists` / pattern `admin-lists-screen` — the order of blocks of a list screen, the query lives in the store, the kit table.
- Rule `entity-models` — two sides (Api / State), namespace levels — the sample is `IMonthRecord`.
- Rule `deploy-flow` — storage migration goes with the receiver rollout; `git-workflow-migration` has the commands.
- Rule `dependencies` / the publish flow — a change on the sending side is a new edition of `@rt-tools/agent-kit` and a layout in every consumer tree.
- Rule `task-flow` — a series of tasks is declared an epic with a plan in `docs/plans/`, all task cards at once.

## Questions and answers

**Откуда приёмнику брать числа? Сводка за 3 дня заменяет запись месяца целиком — помесячных и посессионных чисел нет.**
Сырые наблюдения (Recommended): новый род груза — дерево шлёт строки наблюдений (день, хеш сессии, событие, ресурс), приёмник хранит их и считает сам.

**Что считать «скилом/правилом»? Сейчас уезжают только имена ресурсов пакета, собственные скилы дерева отбрасываются.**
Все вызовы Skill, с пометкой (Recommended): уезжают все загрузки; у каждой — род: правило пакета / паттерн пакета / собственный скил дерева.

**Какие роды строк наблюдений увозить? Четыре: skill-load, gate-deny, guard-deny, push-gate.**
Все четыре, экран — про загрузки (Recommended): строки увозятся как есть, груз и хранилище меняются один раз; первый экран считает загрузки, отказы гейта — второй столбец рядом.

**Где в админке показывать и в каких разрезах?**
Новый раздел, таблица + панель сессий (Recommended): раздел «Использование» со своим правом; фильтры дерево + период; таблица строка = скил: род, загрузок, сессий с ним, отказов гейта; клик по строке — панель со списком сессий (день, хеш, сколько раз). Без графиков.

**Как хранить сырые строки?**
Владелец: «это обычный модуль аналитики» — дальше вопросы не задаются, берётся рекомендованное умолчание: день заменяется целиком (ключ дерево + день), срок хранения — год.

Closed by assumption, not asked:

- **Does the task change behaviour?** Yes — a new cargo kind, a new storage table, a new admin section. A product agreement is written.
- **Law or rule edit?** No law. Two spec lines change: `docs/specs/message-bus/spec.md` "digest over several trees" and `docs/specs/agent-kit/observations/spec.md` "gathering observations from several machines". The `lists` rule and `admin-lists-screen` pattern stay.
- **One task or several?** Four, stacked: (1) sender — the fourth cargo kind in `agent-kit` (`observations` operation, all events, skill kind mark); (2) receiver intake — table `observation`, day replaced whole, retention a year; (3) receiver read — the usage query per tree/period with session breakdown, right `usage:read`; (4) admin section «Использование» with the table and the sessions panel.
- **What is not part of the task?** Charts; per-session token/time cost; changing the existing month digest; unarchiving anything.
- **What shows the task is closed?** A tree ships its lines by `agent-kit propose`; the section shows for that tree and period the same counts as `agent-kit stats --json` printed on the tree; an e2e spec of the section is green.
- **Sample named by the owner: an analytics module of a neighbouring tree of the same layout.** Read whole, two levels deep; what of it carries here, in this tree's terms:
    - one raw event table: session id, event type, subject, arrival time; indexed by `(tree, createdAt)` and by session; nothing personal in a row;
    - the summary is computed in the database by `GROUP BY`, never from rows in memory; unique sessions per step are counted by `COUNT(DISTINCT session)`; top lists are capped at ten rows;
    - the intake refuses a row without a session and an event type outside the known set; a field over its cap is trimmed by bytes without breaking a code point; an intake over the request cap is refused without a row;
    - records live 365 days from arrival, one term for every kind; a nightly job deletes by age only, logs one line per tree with the count, and a failure of the job is a log line, not a crash;
    - the summary window is at most 400 days; the summary comes with the equal window before it for comparison;
    - the screen keeps the old numbers dimmed under a spinner while loading; an empty period draws zeros, not its own text; a failure is one toast for the section;
    - the api lib is split `api / data-access / feature / util`: mappers, SQL queries, procedures + the retention service, models + pure logic.
- **Sample in this tree?** The `summaries` section (list, columns, details aside, read controller, `IMonthRecord` model) and the intake controller of the summary.

## Decisions

- **Sessions are shown by their hash and count, never by name.** The hash is a cksum of the session id; the receiver stores only what the tree sends.
- **The month digest stays as is.** The new lines do not replace it; both live side by side.

## What is left unclear
