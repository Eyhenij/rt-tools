---
name: testing-e2e
kind: pattern
rule: testing
description: Pattern of rule testing. Load when editing and running end-to-end tests in apps/site-e2e and apps/admin-e2e — what an end-to-end test closes, ready-made run commands, a stand from the production build behind real nginx, test switches. Not for unit tests — that is pattern testing-unit.
---
<!-- rt-kit v0.25.0 · patterns/testing-e2e.md · e5f90bf28d15 · правится надстройкой, не здесь -->

# End-to-end tests

Pattern of the rule `testing`. What must be true — the law
`docs/constitution/verifiability.md`.

## When to use

- A test file in `apps/site-e2e/src` or `apps/admin-e2e/src` is being written or edited.
- A defect visible only on the production configuration needs reproducing.
- A stand is being prepared for a run against nginx.

## An end-to-end test closes accumulated state

Its case is the one where state accumulates by clicks: an open panel, an active route, the guard
of the previous screen. Everything checked by one visit to an address is cheaper to close by a
unit test on a pure function or by a screen measurement.

Hence the method: clicks on the same elements the owner clicks, several in a row, with no reload
between them. Entering by a direct address raises the application anew, it has no accumulated state,
and the pass reads as "the defect is not confirmed". That is how a panel that got stuck in the
address on leaving for a neighbouring section went out to production.

Elements are found by `qa-dataid`: classes change together with the layout, and a search by role
and text breaks on translations.

## Run

```bash
npx nx e2e <suite target> -- --project=chromium
BASE_URL=http://localhost:$PROXY_SITE_PORT npx nx e2e <suite target> -- --project=chromium   # against an external stand
```

The runner target names and the port numbers are each tree's own: the pattern does not know them.
The tree names them by its own profile — by environment variables or by an override section of
this pattern, where the ready-made commands stand with its names.

By default the config goes to the site stand port and picks up the server already raised. With
`BASE_URL` no server of its own is started.

The full admin suite is run **by one worker** (`--workers=1`): tests with a real session edit the
same objects of the live database and get in each other's way in a parallel run. The same files
gave three failures on eight workers and zero on one.

## A stand from the production build behind real nginx

How to raise it — pattern `browser-verification-stand`; it also says why the main config is
mounted by a separate line and why as a directory, not as a file. One thing matters here: against
such a stand the run goes with `BASE_URL`, and with it the locale redirect checks switch on.

## Switches

```typescript
const ALLOW_RENAME: boolean = process.env['E2E_ALLOW_SLUG_RENAME'] === '1';
test.skip(!ALLOW_RENAME, 'меняет живой адрес объекта: включается E2E_ALLOW_SLUG_RENAME=1');
```

Switches come in two kinds, and only the first counts as coverage. **A switch by stand state**
skips a case the stand never has by design — the scenario is closed, and it needs no mark. **A
switch by environment variable** leaves the test unrun: the scenario behind it is listed as
covered while nothing checks it, and such a scenario carries a partial-coverage mark with a
reason. Of the three below not one belongs to the first kind: all three are driven by a variable.

- A test that irreversibly changes stand data is skipped by default and switched on by its own
  variable.
- `BEHIND_NGINX` in `home.smoke.spec.ts` is `!!process.env['BASE_URL']`: with it the locale
  redirect checks wake. A bare page-serving server does not pass them, and two failures look like
  a regression.
- `HAS_ADMIN_SESSION` in `sign-in.ts` — the pair `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD`.
- `playwright/no-skipped-test` is switched off in `eslint.config.mjs`: the test switch here is a
  technique, not a forgotten `test.skip`.

## A redirect code is checked by the answer, not by following it

The browser follows the redirect itself, and the code after it is the code of the final page: a
test named "answers 301" asserted 200 and would not have noticed a permanent redirect replaced by
a temporary one. The answer itself is asked, without following it:

```ts
const answer = await request.get('/old-address', { maxRedirects: 0 });

expect(answer.status()).toBe(301);
expect(answer.headers()['location']).toBe('/new-address');
```

Telling a permanent redirect from a temporary one is needed where an agreement rests on it: search
robots and the browser remember only the permanent one, and the difference between 301 and 302 is
visible only in the answer.

## The screen state after an action is awaited by polling, not read on the next line

Between the click and the new content lies the network: the filter goes into the address by the
click, and the rows arrive by the server's answer, and those read at once are still the old ones.
A test that reads a column on the next line passes on its own machine and turns red in the
pipeline: there the answer comes later, and the difference between machines decides the outcome.

So the state itself is awaited — by polling until it matches the expected one, not by one read and
not by a pause for a time. A pause checks the machine: on a free one it is always enough, on a busy
one it is not, and which test did not make it turns out a matter of chance.

This knowledge is entered in the rule, not in the shared module of the suite. Written only as code,
it is known to whoever wrote it — the next test repeats the miss, because it reads the rule, not the
code.

## Common misses

- **Take the rendering server port with care:** the developer's stand goes by the same name
  `ssr:<rendering port>` through `host-gateway`, and while a foreign process hangs on it, the stand
  serves a foreign build.
- There is one browser — chromium; narrow screen — `--project=mobile-chrome`. The error "Executable
  doesn't exist" is taken apart in the rule `testing`: the same one comes after a Playwright version
  change.
- Admin tests without a session are skipped silently — the run looks successful, while less than
  half was checked.
- The nginx config is mounted as a directory, not as a single file: the editor recreates the file,
  and the container is left with a truncated copy.
- **Not only what the screen requests is substituted, but also what the header requests.** The
  unread counter is requested on every screen under the header. Without a substitution the real
  server answers that request, refuses the fake sign-in, the interceptor drops the session, and
  fifty-nine tests fail on the vanished header — it looks like a screen defect.
- **State that lives only during an operation is not checked by a test.** The upload list under the
  button is visible while the files are in flight: on substituted answers they land before the test
  manages to read it, and the test turns red every other run. What is checked is either the final
  state (the row's `data-state` became `done`) or the same intermediate one — but on an answer the
  test itself delayed and itself releases.
- **A double moved from a test file into the suite's shared file leaves the exclusion of the
  duplicate check.** It skips test files and reads everything else, doubles and settings included,
  and compares the declaration name — not the value and not the purpose. A setting that lay in a
  test file under a common name matches, after the move, the one of the same name in another layer,
  and the check turns red on a file the edit did not touch. Taking such red apart takes a separate
  turn. On the move the name gets the prefix of its suite; no line goes into the known list — it
  only shrinks.
- **A build directory removed under a mounted volume leaves the container with an empty root:** the
  stand answers 403 to everything, and all tests fail at once. After
  `rm -rf dist/apps/<application>` the container is recreated.

## Прогон

Раздел этого дерева: сквозной набор один — админка приёма, цель раннера `message-bus-admin-e2e`.

```bash
pnpm run serve:stand                       # прод-сборки на 3310 и 4310, своя засеянная база
pnpm exec nx e2e message-bus-admin-e2e     # против поднятого стенда
```

Стенд поднимает и приёмник, и админку, и базу под себя: рабочих портов он не занимает, и данные
рабочей базы прогоном не трогаются. Адрес админки набор берёт из `E2E_ADMIN_PORT`, приёмника — из
`E2E_API_PORT`; умолчания стоят в `apps/message-bus-admin-e2e/stand/stand.mjs`.

Сайта и сервера отрисовки в этом дереве нет, поэтому строки паттерна о них здесь не исполняются.
