# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Delivery
- **Done:** all seven remarks in the code and checked on a stand of my own (Keycloak 26.8.1 — the
  version of the application); the spec rules, bindings and scenarios SC-AUTH-64, 97–99 rewritten;
  theme unit tests 61/61, lint and styles lint green. Stand and browser tab stopped.
- **Next step:** session handover at window fill 46 %. In a new session in the worktree
  `.claude/worktrees/RT-3125`: take this folder apart into `docs/archive/RT-3125-auth-theme-remarks.md`
  (the grill whole plus «Decisions along the way»; skills `doc-style`, `archive-record`), commit, then
  push — the push set raises the auth stand and runs `auth-example-e2e` for this branch, and the
  owner's standing word lets the gate raise and stop it; then the PR as a draft to the owner
  (reviewer Eyhenij), then after the merge `publish-auth-keycloak-theme.yml` → 0.3.0, and the
  version with the JAR sha256 goes to the requesting session (note in its shared folder
  `rt-tools-RT-3125.md`). `check:specs` passed; the theme is 0.3.0 (0.2.1 was never released).
  Build the JAR with `JAVA_HOME=/opt/homebrew/opt/openjdk`.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Every language is named by its own name with a capital letter
- [x] 1.2 The links between the entry pages carry the chosen language
- [x] 1.3 The info page is laid out like the login form and always leads on
- [x] 1.4 The reCAPTCHA widget stands without its frame
- [x] 1.5 On a wide screen the switches stand in the top right corner on their own pad
- [x] 1.6 The icon of the message banner stands on the line of its text
- [x] 2.1 The theme JAR is built and the stand is raised
- [x] 2.2 The screens are measured at 1440, 768 and 375 in both themes
- [x] 2.3 The stand is stopped
- [x] 3.1 The spec rules, their bindings and the scenarios say what the theme does now
- [x] 3.2 The theme version is raised
- [>] 4.1 The check set passes
- [ ] 4.2 The task folder is taken apart into the archive
- [ ] 4.3 The PR opens and is shown to the owner
- [ ] 4.4 After the merge the theme release is published

## Decisions along the way

- **Item 19 needs no code: the kit already fixed it after 0.2.0.** The 0.2.0 build (f60176413)
  had `margin-block-start: var(--rt-space-0-5)` on `.rt-message__icon`; 97a58dfa2 removed it on
  30.10. Measured on the stand: icon glyph centre 500, text line centre 500. The owner's «править в
  апке + запрос в кит» was conditional on the shift being in the kit — it is, and the kit main
  already carries the fix; no kit request is filed. Affected stage: 1.
- **Item 17 is built by the application's mockup.** The owner answered «как на макете»: frames
  9295:1030/9295:1098 of the application's Figma file (I3fuRHUIcEhw6WPIsd29nP), layer «Язык и тема ·
  карточка». Measured at 1440: pad at (1222, 20), 198×58, list 132 wide at (9, 13) — equal to the
  frame. Padding space/sm on every side, border default, radius lg, ground surface at 60 %, blur as
  the card (20 px). Shadow: the frame has 0 8 24 8 % which no token carries; `--rt-shadow-card`
  (0 4 16 8 %) is taken, the light shadow of the card. Threshold: corner from 768 up (the mockup
  draws 768 in the corner). Affected stage: 1.
- **The switches leave the card in the markup.** The card glass (`backdrop-filter`) holds a fixed
  child inside the card, so the kit pinning to the window cannot work from there; on a narrow
  screen card and switches share one grid cell. SC-AUTH-64 rewritten. Affected stage: 1.
- **Item 18 does not reproduce inside Keycloak.** On 26.5.5 and 26.8.1 the language chosen on the
  sign-in held to the registration and back without `kc_locale`, also under `ui_locales=en`. The
  application sends `ui_locales` with its own stored language on every new entry
  (its e2e SC-AU-130), and that wins over the person's choice on a new entry. The theme now puts
  `kc_locale` on its entry links (a restarted entry keeps the language); the rest is the
  application's side — told to the requesting session. Affected stage: 1.
- **Item 21: the bare «Email address verified» page was not reached on the stand.** On 26.8.1 the
  link opened in another browser went on to the password update, and the admin-sent letter ends on
  «account updated» with `skipLink: true`, which the theme respects. The fallback to the sign-in is
  covered by SC-AUTH-99 and the info layout with its button measured on «Email address validation».
  Affected stage: 2.
- **The stand is a Keycloak of my own**, container `rt3125-keycloak` on 58180 with `rt3125-mailpit`
  on 58125, both removed. The rt-auth stand was up under another session with another JAR and was
  not touched. Affected stage: 2.

## Sessions

### 2026-11-06

- Worktree `.claude/worktrees/RT-3125` from origin/main: the main copy stands on the draft of RT-3122.
- Code: `kc-language-name.ts`, `kc-locale-links.ts`, info fallback, root template, `styles.scss`;
  three new spec files. 61 tests green.
- Measured: corner pad 1440/768, in-card 375, both themes; widget frame cut (compared with the
  clip off at 3× zoom); validation page text centred, address whole on its own line at 375, bottom
  padding 65 as on the login form. Keycloak default CSP blocks the Google frame — the stand realm
  needed `frame-src https://www.google.com`.
