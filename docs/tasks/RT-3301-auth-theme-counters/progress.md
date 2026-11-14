# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 из 2 — The stand, closed
- **Done:** both stages; the stand showed the page view, the hit and the submit event
- **Next step:** the roles review, the folder taken apart, the push and the PR
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the counters module with its unit tests
- [x] 1.2 Start the counters from the entry point for every page
- [x] 1.3 Declare the theme properties and pass the variables to the Keycloak containers
- [x] 1.4 Write the rules and the scenarios into the theme spec
- [x] 2.1 Raise the theme stand with test numbers set
- [x] 2.2 Read the network of the sign-in page and of a submit

## Decisions along the way

- **The README of the theme names the two variables.** The login node sets them, and the theme README is where its owner reads the build and the use. Affected stage of the plan: 1.

- **The page id is the template name without `.ftl`.** Keycloakify names a page `login.ftl`, and the stand showed `ep.page_id=login.ftl`; the brief names pages `login`, `register`. Affected stage of the plan: 1.
- **The theme version is raised to 0.4.0.** The counters are a new ability; the release itself waits for the owner's word. Affected stage of the plan: none.

## Sessions

### 2026-11-14

- The working tree `rt-auth-counters` from origin/main by the owner's word; the task RT-3301.
- Stage 1: lint, 74 unit tests and the build of the theme green; `check:specs` names none of SC-AUTH-108…112.
- Stage 2: a stand of its own (project `rt-auth-counters`, Keycloak on 58380) with `G-RTSTAND01` and `99999901`. On the sign-in page: `gtag/js` 200, `g/collect` with `en=page_view` and `ep.page_id=login` (503 for the made-up id), `mc.yandex.ru/watch/99999901` with `site-info={"page_id":"login"}`. On a submit with a made-up address: the Metrika goal `goal://localhost/auth_form_submit` and the GA `en=auth_form_submit` with `ep.page_id=login`; neither carries the address or the password. The GA request goes as a keepalive fetch, which the browser network list misses on leaving the page: it was read by wrapping `fetch`. The console showed no security policy refusal under the Keycloak default `frame-src 'self'`, and Metrika asked for no frame.
