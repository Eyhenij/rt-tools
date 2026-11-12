# browser-verification — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. A separate file because the rule speaks by
technique and travels between repositories whole, while everything below is true only here and
goes stale at every renaming.

There are three kinds of stand here, and they answer different questions. The showcase shows a kit
component in all its declared states — the layout of a component is judged by it. The tree's
applications — the receiver and the admin panel — come up on one's own machine by the `serve:*`
commands and show what a person sees. The end-to-end suite's stand raises the production builds of
both on ports of its own with its own seeded database: on it one looks at the states that never
happen in the working database.

## What it is called here

- **In the rule** — Here
- **a stand** — the showcase: the first kit at `http://localhost:6006`, the second at `:6007`; the applications: the receiver at `:3000`, the admin panel at `:4200`; the end-to-end suite — its own `:3310` and `:4310`
- **the browser driver** — the claude-in-chrome extension; there is no other way in
- **the pinned profile** — the identifier from `.claude/rt-kit/browser-device-id` — a file of the machine, it does not travel into the repository
- **a measurement** — the computed values of a node, taken from the page rather than by eye from a screenshot

## Where it lives

- **the helper that prints the profile** — `.claude/hooks/browser-device-id.sh`
- **the profile choice guard** — `.claude/hooks/browser-guard-device-id.sh`
- **the choice freshness guard** — `.claude/hooks/browser-guard-require-select.sh`
- **the workaround guard** — `.claude/hooks/browser-guard-no-other-drivers.sh`
- **the listing and switching guard** — `.claude/hooks/browser-guard-no-listing.sh`
- **the guard against asking about the profile** — `.claude/hooks/browser-guard-no-asking.sh` — a file of this tree, the package does not carry it
- **the stories and the overview pages** — `projects/<kit>/src/**/stories/`, `projects/ui-kit/docs/*.mdx`

## The stands of this tree

The list the hooks print in a refusal is declared by the profile override —
`.claude/rt-kit/project.sh:RT_STANDS`: the receiver on 3000, the admin panel on 4200, the end-to-end suite's stand on 3310 and 4310, the `ui-kit` showcase on 6006, the `ui-kit-v2` showcase on 6007. The list omits the entry example's stand (3410, 4410) and its Keycloak (58080). The hook that reads the variable is not laid out here — it stands in the `skip` list of `.claude/rt-kit.json` — so the list is read by a person, and the refusal text of the browser guards stays general.

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **A second instance of an application that is already up is not raised.** — **Not carried out.** The package guard `dev-server-guard.sh` has a mode for this, and the tree drops it by `skip` in `.claude/rt-kit.json`; it is held by the order: `lsof -nP -iTCP:<port> -sTCP:LISTEN` before the startup — `6006` and `6007` on the showcases, `3000` and `4200` on the applications, `3310` and `4310` on the end-to-end suite's stand. A taken port means something is already up: an instance built from this branch is used, and one built from another branch is left alone while the stand goes on a free port (`E2E_API_PORT`, `E2E_ADMIN_PORT`); a separate showcase instance for the snapshot run comes up on its own port and is passed through `STORYBOOK_URL`. Everything is raised by the agent itself: `pnpm run storybook:ui-kit-v1`, `storybook:ui-kit-v2`, `serve:db`, `serve:api`, `serve:admin`, `serve:stand`.
- **The browser is driven by one driver on the pinned profile.** — `.claude/hooks/browser-guard-no-other-drivers.sh:deny` — it refuses the second and third drivers, opening a link by system means, launching the binary and driving by an automation script.
- **A browser raised by a library from inside a script is the same as launching the binary.** — `.claude/hooks/browser-guard-no-other-drivers.sh:launch` — it judges the content of the file being run and the code passed as an argument instead of a file, against the entry points of browser libraries; a file that does not exist it does not judge at all.
- **The browser choice goes stale and needs a repeated call.** — `.claude/hooks/browser-guard-require-select.sh:ttl` — the choice mark lives five minutes and is refreshed by every call that passes.
- **A refused profile choice ends the work with the browser; it does not start a search for a workaround.** — `.claude/hooks/browser-guard-device-id.sh:answer` — the hook reads the refusal of the choice and sets no mark, and `.claude/hooks/browser-guard-require-select.sh` then refuses every browser call. **Not checked by anything** is a mark still alive from an earlier choice: it is not removed by a later refusal.
- **The profile is not picked from the list and not asked from the owner.** — `.claude/hooks/browser-guard-no-listing.sh:device_id` refuses the listing and the switching, `browser-guard-no-asking.sh` — the question about the profile itself.
- **An unconfigured guard is a reason to stop, not a permission to go on.** — **Not checked by anything.** The browser guards let a call through when they themselves failed to work — that is their declared `FAIL-OPEN`; whether the executor stopped after the helper's empty output or went on is visible to none of them. In this tree one exception stands, by the owner's word of 13 October 2026 quoted in the override: with no pinned profile and exactly one connected browser, that browser is selected and pinned — the override section «When this machine has no pinned profile». With two or more, the executor stops.
- **A screen behind sign-in is checked on a stand, not with a live account.** — `apps/message-bus-admin-e2e/src/support/admin.ts:signIn` — the sign-in goes through the form, as a person's does, and the pair is taken from the stand: `apps/message-bus-admin-e2e/stand/stand.mjs:ACCOUNT`.
- **A screen whose data never exists in the development database is measured with the component's real styles.** — **Not checked by anything.** To a machine inserted markup is indistinguishable from markup that came from the server — that is exactly how the technique works; the honesty of the measurement is held by the styles being taken from the open screen rather than invented together with the row
- **Changing the number of elements in a container is a layout edit.** — **Not checked by anything.** The document width is invisible in the text of the edit, and a guard has nothing to judge by; it is caught by a measurement at every layout threshold of the tree, on both sides of each — the pattern `browser-verification-measure` or an end-to-end spec with a set viewport
- **A measurement is taken on the longest value, not on the sample one.** — **Not checked by anything.** Text clipping by the browser is invisible in the markup: the specs read the whole text and are green on both sides of the miss. Held by a measurement — the pattern `browser-verification-measure`
- **The longest value is set for every node that shares the line, not only for the edited one.** — **Not checked by anything.** The width of a line with a long neighbour is invisible in the markup, and the specs read the text whole. Held by a measurement with the longest value in every node of the line — the pattern `browser-verification-measure`.
- **A move of people into a sign-in system is checked by signing in as a moved person.** — **Not checked by anything.** The sign-in specs of the stands use people with a filled profile, and nothing compares the profile fields of the move file with what the system requires of a profile. Held by the sign-in through the form as a moved person.
- **A ready-made kit piece taken for values of another size is measured, not looked at.** — **Not checked by anything.** Neither the linter, nor the build, nor a showcase snapshot knows what value the component will be filled with at a consumer; a snapshot catches this only where a frame of its own is started for the new place
- **An edit of a shared frame is checked on every screen under it.** — `.claude/rt-kit/project.sh:rt_push_checks` picks the suites before a push by the subject an edit touches: `receiver` runs `message-bus-admin-e2e:e2e`, `auth` runs `auth-example-e2e:e2e`, `kit2` runs both. The first holds the admin frame in `apps/message-bus-admin-e2e/src/shell.spec.ts`, the second the entry in `apps/auth-example-e2e/src/entry.spec.ts`. They cover the screens these suites open. Nothing compares an edit of a frame with the list of screens under it: a page without a suite stays with the executor.
- **The stand proxy supplies what the application recognises the request's tenant by.** — **Not applicable.** Neither application here keeps several organisations behind one address: the receiver tells callers apart by the token of the request, not by a header of the host, and a request to the showcase belongs to nobody at all.
- **The production configuration is checked only behind the real proxy.** — **Not checked by anything.** The tree's proxy is Caddy (`deploy/Caddyfile`, built into `deploy/message-bus-web.Dockerfile`), and no stand runs it. The suite's stand raises production builds of both applications, and its own serving, `apps/message-bus-admin-e2e/stand/serve-admin.mjs`, only forwards `/api` to the receiver. On the kits the closest is the built showcase (`pnpm run build-storybook:ui-kit-v1`) against the showcase in development mode. The three launch paths of the receiver are `pnpm run serve:api`, the image `deploy/message-bus.Dockerfile` and the composition `docker-compose.prod.yml`.
- **What is shown to a person is built from the work under discussion.** — **Not checked by anything:** building the stand is an ordinary build command, and it is invisible from it that what was built will go to the owner. Held by what is said about the shown naming the branch.
- **The work branch keeps the tip of its base merged in the whole time, not only before delivery.** — `.claude/hooks/git-guard-delivery.sh:behind` — the guard judges how far behind main the branch is when a request is opened, and `.claude/hooks/git-guard-delivery-epic.sh:rt_epic_pull_base` judges the lag from the branch of the epic for a task of an epic. The lag from the previous branch of a chain nobody judges, and between deliveries nothing judges any of them.
- **A measurement that will have to be repeated is taken by an end-to-end test, not by the driver.** — `apps/message-bus-admin-e2e/src/list-state-filter.narrow.spec.ts:viewport` — the window width is taken from the page, the position and width of a node from its rectangle; the rest of the specs with the `.narrow` suffix measure the list and the filter the same way. The viewport is set per project in `apps/message-bus-admin-e2e/playwright.config.ts`: a wide one and a narrow one.
- **A measurement is taken before the work is shown to the owner, not after their remark.** — **Not checked by anything:** the turn has no minute of showing at all, and there is nothing to tell a measurement before it from one after. Held by the order: the reference numbers lie in the grill of the request, and the audit against them goes in the same turn as the showing.
- **Work that carries a look over from a sample is accepted by a frame of one's own screen next to the sample's frame.** — **Not checked by anything.** No check knows whether a screen was opened after the edit. A frame next to the sample's is read by a person. Held by the closing step: the frames go into the PR body before the draft is lifted.
- **The first visit to a public screen is marked with the service-visit sign.** — **Not applicable.** The tree has public pages — the chat page and the widget — but no counter of page views in `apps` or `libs`: there is no sign to mark a visit with. A check that starts a talk in the widget does write a visitor row.

## What else is worth knowing when reading the code

- **There are two ways into the browser here, and the second is not a workaround.** The
  extension drives a live tab on the pinned profile and demands the owner at the machine. The
  driver standing in the tree for the snapshot runner is driven by a script without it — it is
  what takes the measurements, the narrow screen and the sweep over all the stories
  (`tools/story-sweep-v2.mjs`). The workaround guard watches opening an address by system means,
  driving the driver from the command line, a second driver of a live tab and the content of a
  file run directly by an interpreter. So `node tools/story-sweep-v2.mjs` is refused, and the same
  sweep through its package script, `pnpm run test:stories:v2`, the guard does not see — that is
  the path the second way goes by.
- The profile is pinned on the machine and does not travel into the repository: the file
  `.claude/rt-kit/browser-device-id` is excluded from the index. With no file all the browser
  guards let through, and that is done deliberately: a guard that cannot name the right profile
  offers nothing in its stead.
- A spec and a showing in the showcase do not replace one another: a spec proves that a state
  came about, and the showcase that it looks as promised. That is written down by the law of
  verifiability and by the override to it in `.claude/rt-kit/overrides/laws/verifiability.md`.
- The second kit's showcase must show every declared state of a component; what cannot be shown
  is marked with a reason — the rule `rt-tools-storybook`.
- The showcase for the eyes may not be raised with `RT_SNAPSHOT_RUN=1`: the variable removes the
  pseudo-state addon, and hover, focus and active disappear from the showing. It is set only by
  the snapshot run command.

## What this is checked by

- `pnpm run storybook:ui-kit-v1` and `pnpm run storybook:ui-kit-v2` — the showcases of the first and the
  second kit.
- `pnpm run build-storybook:ui-kit-v1` — the built showcase, if a divergence looks like a trace of
  development mode.
- `pnpm run test:visual` — a snapshot of every story of the first kit against a reference; the
  references themselves lie in `projects/ui-kit/.storybook/__snapshots__/`, the references are tracked in the
  repository, the divergences go to `__diff_output__` next to them. They are updated
  deliberately: `pnpm run test:visual:update`. The run goes against an already raised showcase;
  the address is overridden by `STORYBOOK_URL`.

## About the showcase snapshots

- **A showcase reference is taken in the browser image, and it matches on any machine.** Both kits
  shoot in the image, so a reference taken here matches the pipeline's runner, which stands on
  another machine: the first step of the run log names it (`Runner name`). A frame shot by the
  machine's own browser diverges there on dense text by a few hundredths of a percent while the
  layout is the same, so such a frame is never committed as a reference.
- **A snapshot and a measurement answer different questions.** A measurement of computed values
  says only what it was asked about; a snapshot catches everything visible, but fires on a shift
  of one pixel too. One does not replace the other.
- **What is not deterministic does not get into a story.** Random data is pinned by the
  generator's seed (`faker.seed` in `preview.ts`), pictures are embedded into the address instead
  of being loaded from the network, the icon font waits for readiness — until then `rtui-icon`
  keeps itself invisible.
- **The framework's animations do not go through CSS.** Declaring a zero duration does not stop
  them: before a snapshot they are driven to the end through the animations interface, otherwise
  the action bar gets into the frame halfway along.

## About the narrow screen

The narrow-screen threshold here is `599px` — both the media query
`media-breakpoint-down($device-xs)` and `BreakpointService` measure by it. A browser window on
macOS does not narrow below about `606px`, so neither by the driver nor by hand can the threshold
be reached: the narrow view is checked by the showcase driver, which sets the frame size itself.

The driver stands in the tree for the snapshot runner. A one-off script that launches it is
refused by the workaround guard when run directly, so the measurement goes into an end-to-end spec
with a set viewport or into the snapshot runner; the calls themselves look like this:

```javascript
const page = await browser.newPage({ viewport: { width: 599, height: 900 } });
await page.goto('http://localhost:6006/iframe.html?id=<story>&viewMode=story', { waitUntil: 'networkidle' });
await page.evaluate(() => getComputedStyle(document.querySelector('<selector>')).visibility);
```

- **The measurement is taken on both sides of the threshold, not on one.** A value on a narrow
  screen without the value on a wide one does not tell a rule that moved from a rule that always
  applied.
- **The showcase passes `isMobile` deliberately**, and on a narrow frame the markup branch stays
  the wide one. The branch is switched not by the frame size but by the story argument:
  `&args=isMobile:!true`.
- **A rule with nothing to hang it on is checked by hanging the class.** A modifier that is set by
  measuring the content may fire at no width at all in the showcase; then the class is added from
  the page, and the computed value under it is measured.

## Who raised a running showcase

Before asking the owner to restart a showcase, the session asks the machine whose it is. A stand
raised by an agent session is that session's to restart, by process id; a stand raised by the owner
is theirs. The answer is the parent chain of the process on the port:

```bash
p=$(lsof -nP -iTCP:6006 -sTCP:LISTEN -t | head -1)
while [ -n "$p" ] && [ "$p" != 1 ]; do ps -o pid=,ppid=,command= -p "$p" | cut -c1-120; p=$(ps -o ppid= -p "$p" | tr -d ' '); done
```

A chain passing through `zsh -c source …/.claude/shell-snapshots/…` and a `claude` process was
raised by an agent session. A chain reaching a terminal or the editor without `claude` in it was
raised by a person. Which session of several it was, the chain does not say; the session's own
background task list does.
