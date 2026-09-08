# The shell of the admin application: the sections, the profile, the theme and the language

**Status:** in force · **Revision:** 2026-08-18 · **Scenario prefix:** `SC-MB`
**Depends on:** the subdomain "the reading of what was taken in" — `docs/specs/message-bus/admin/`
**Laws:** `frontend-application`, `reuse-first`, `navigation`
**Procedures:** none — the shell lives on the side of the showing

A subdomain of the domain "the intake of the cargo": what a person gets around the list — the top row
of the sections, the popup of the profile, the choice of the theme and of the language, the screen of
the entry and the shell of the page. What the sections themselves show is described in the subdomain
"the reading of what was taken in" next to it.

## Why

The shell of the admin application and the screen of the entry were never once checked against the
sample, and the check named the divergences by a list; there was one large item in it — the menu. Here
it stood as a left column of tiles, at the sample — as a top row of the page with the profile on the
right.

That cost a person three things. A press on the profile exited at once — the entry was lost by one
miss past the neighbouring button. The toast about the outcome of the revocation of an invitation was
shown twice and in two different places of the screen: the stack is drawn by the framework of the kit
itself, and the shell created a second one. And a place where a person could change the theme or the
language was not in the application at all, although the kit can do both.

## Terminology

The vocabulary of the domain whole is in the spec of the domain. Here only what this subdomain
creates:

| Term                     | What it is                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| The top row              | The strip above the content: the name of the application, the sections, the profile. It is given by a ready component of the kit     |
| An item of a section     | A link of the top row leading into a section. The highlighting of the current one is given by the router                             |
| A panel of the sections  | The second level of an item: the columns and the groups. Today no section has one                                                    |
| The popup of the profile | The list under the name of whoever entered: the theme, the language, the exit                                                        |
| The theme of the look    | The light or the dark look of the application. The choice lives on the device and outlives a reload                                  |
| The language of the kit  | The language of the labels the kit draws. The labels of the admin application and its dates do not depend on it                      |
| The shell of the entry   | The shared part of the screen of the entry: the name, the card, the switches of the theme and of the language. The form lives inside |
| The stack of the toasts  | The place the notifications are shown at. It is drawn by the framework, and it is one per application                                |

### What it is called in the interface

| In the spec                | On the screen                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| the top row                | the strip above the list: the name on the left, the sections after it, the profile on the right           |
| an item of a section       | the name of the section in that strip                                                                     |
| the popup of the profile   | the list unfolding under the name of whoever entered                                                      |
| the switch of the theme    | a button with a sign: it shows what it will switch to                                                     |
| the choice of the language | a pair of buttons "RU" and "EN" in the popup of the profile and on the screen of the entry                |
| the shell of the entry     | the screen of the entry itself: the card in the middle of the page and the strip of the controls above it |

## Rules

**The sections, the profile, the theme and the language.**

- **The sections are shown by the top row of the page, not by the left column.** The look of the
  application is appointed by the sample; the left column at four sections takes the width the list
  reads, and there must be no second answer in the application to the question "where to look for the
  sections".
- **The top row is drawn by a ready component of the kit.** A strip of one's own would diverge from the
  sample in the paddings, in the highlighting and in the behaviour of a narrow screen, and would be
  edited here, not in the kit.
- **An item is declared by the declaration of the menu and carries the address of the section.** A menu
  put together by markup diverges from the routes silently: the item stays, the screen moves away, and
  the person lands in emptiness.
- **The highlighting of the current section is given by the router, not by the shell.** Counting it
  itself, the shell answers the question about the address a second time — and diverges from the first
  answer at the very first address with a parameter or with an open panel.
- **There is no panel of the second level while there are no nested sections.** An unfolding panel with
  nothing behind it promises sections that do not exist; it is created together with the first nested
  one.
- **The name of the application stands in the same row, to the left of the sections.** There is no
  separate strip under it: two strips above the list take height from it, and neither is busy with a
  matter.
- **The application calls itself by a word, not by a sign.** The drawing of a sign the kit does not
  carry — it comes from the application — and while there are no files, the place under the sign is
  taken by emptiness. A word from the dictionary of the application is visible at once and in both
  themes.
- **On a narrow screen the same sections open by a burger button.** It is drawn by the kit; the top row
  creates no narrow layout of its own.
- **A press on the profile opens the popup, it does not exit.** An exit happening from one press next
  to the sections is lost by a miss past the button, and the person introduces themselves anew.
- **The popup of the profile shows the name of whoever entered, the theme, the language and the exit.**
  The name answers the question of who entered: the service has several accounts, and one record
  sometimes has two entries.
- **There is no changing of the password in the popup.** The password is changed by a command of the
  launch line — there is no operation for the web at all, and the item would promise an action that
  does not exist.
- **There is no bell of the unread.** The admin application has no source of events, and a counter
  would always show zero.
- **The exit breaks off the entry that was come by and leads away to the screen of the entry.**
- **There are two themes, and a person chooses between them.** The kit can do both; the choice was
  appointed by the owner at the analysis of the task about the top row.
- **The choice of the theme lives on the device and outlives a reload.** A theme resetting to the light
  one at every visit means there is no choice.
- **The switch of the theme stands both in the popup of the profile and on the screen of the entry.**
  The entry is the only screen a person finds themselves at before the popup, and the dark theme is
  needed on it by exactly the same eyes.
- **Both themes are checked by a measurement, not by a look.** The dark look breaks where a colour is
  written as a value instead of a token, and on a light screen that is not visible.
- **A person chooses the language of the labels the kit draws.** There are two languages: the Russian
  set of the application and the English default of the kit. A third one is a loader of dictionaries,
  which the work does not create.
- **The labels of the admin application stay Russian at any choice.** There is no multilingualism here,
  and the dictionary of the application is one; the choice of the language changes only what the kit
  draws.
- **The dates in the lists are shown in one shape at any choice.** They are drawn by the admin
  application itself — by the day, the month, the year and the minutes in figures — and that shape reads
  the same in both languages; there is no locale of the kit in them at all.
- **The choice of the language stands on the screen of the entry and in the popup of the profile.** Put
  only at the entry, it does not change after the entry at all — while the labels of the kit a person
  gets at every list.
- **The choice of the language lives on the device and outlives a reload.** By the same thing the choice
  of the theme lives by.

- **A header pinned at the top is opaque over the whole width.** The row of the kit paints only itself,
  and to the left of it stands the name of the application; an unpainted strip under it lets the
  scrolled rows through.
- **What stands above the page paints its own ground itself.** The overlay of the kit draws no ground —
  it carries the node out to the end of the page and puts it in place — and a transparent popup on a
  scrolling page lies over the rows of the table, and there is nothing to read it by.

**The screen of the entry and the shell of the application.**

- **The form of the entry stays reactive and a component of its own.** The name, the heading and the
  strip with the theme and the language belong to the screen, not to a pair of fields; folded into the
  form, they go away together with it into any other place the form is needed at.
- **The fields of the entry carry an icon and a placeholder.** An empty field without a hint answers the
  question "what is written here" only by the label at the side, and on a narrow screen it goes away
  first.
- **A refusal of the entry stays a message in the form.** A toast about a wrong pair goes away in a few
  seconds, and the reason of the refusal is needed exactly in the minute the person is fixing the field.
- **The stack of the toasts is one, and it is drawn by the framework.** A second one, created by the
  shell, shows the same toast a second time and in another corner of the screen: the bus is listened to
  by each of them.
- **The heading of the tab names the application, not the project of the build.** The name of the
  project in the list of the tabs answers the question of what this is built by, not of what is open.
- **The page declares the language of the document as the one it is written in.** Russian text under an
  English sign of the language is read by a speech synthesiser by the English rules.

## What is out of scope

- **Gating the sections by rights.** There are no rights inside the admin application: whoever entered
  gets everything — the word of the owner, written down in the spec of the subdomain of the reading.
- **Multilingualism of the labels of the admin application.** The dictionary of the application is one
  and Russian; the choice of the language changes the labels of the kit, and only them.
- **The bell of the unread and the counters.** There is no source of events — this is a new
  opportunity, not a finishing.
- **Rebuilding the form of the entry.** It needs a finishing: the reactive form and a component of its
  own stay.
- **Changing the scheme of putting the shell on.** The shell stays one root route: at the sample it is
  put on every domain, because there are several shells there, and here it is one for all the sections.

## Contract

The subdomain creates and changes no procedures: the edit goes by the side of the showing, the
requests to the intake stay the same. The exit calls the same operation as before. The theme and the
language do not go outward at all: the choice lives in the storage of the device, and the intake knows
nothing of it.

### Refusal codes

Not applicable: the subdomain creates no refusal codes of its own. A refusal of the entry is served as
a message in the form, and the intake answers with the same code without naming what exactly did not
match.

## Data

The subdomain creates no data of its own in the intake. Two values live on the device:

| What                | Where                                                 | What for                                             |
| ------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| The theme           | The storage of the device, the key of the kit         | The theme outlives a reload and a new entry          |
| The chosen language | The storage of the device, the key of the application | The same; at the first visit the language is Russian |

## Screens and states

| Screen                   | State                 | What is there                                                                              |
| ------------------------ | --------------------- | ------------------------------------------------------------------------------------------ |
| The top row              | A section is open     | The name, four items, the current one highlighted, the profile on the right                |
| The top row              | The page is scrolled  | The header stands at the top, and the scrolled rows are not visible under it               |
| The top row              | A narrow screen       | The name, a burger button with the same sections, the profile                              |
| The popup of the profile | Closed                | The name of whoever entered and the pointer of the unfolding                               |
| The popup of the profile | Open                  | A panel with its own ground, edge and shadow: the name, the theme, the language, the exit  |
| The screen of the entry  | An empty form         | A card with the name, the fields and the button; the theme and the language above the card |
| The screen of the entry  | Sending               | The button is busy, the switches are in place                                              |
| The screen of the entry  | A refusal of the pair | A message in the form; the fields and the switches are in place                            |
| Any screen               | The dark theme        | The same screen in dark tokens; a second stack of toasts does not appear                   |

The table of the states is checked by nothing: the states are confirmed by scenarios and by a
measurement in the browser.

## Cross-cutting requirements

### Locales

The labels of the admin application are Russian at any choice of the language; the choice changes the
labels of the kit, and only them. The admin application shows the dates in a shape of its own, and it
does not depend on the language.

### SEO

Not applicable: the admin application is closed by the entry, and there is nothing to show outward at
the screen of the entry.

### Mobile layout

The sections on a narrow screen open by a burger button — this is the narrow layout of the top row
itself, not one of its own. The screen of the entry at a narrow width holds the card and the strip of
the controls above it in one column. It is confirmed by a measurement, not by a look.

### Several objects

Not applicable: the intake is one, and the theme and the language belong to the device, not to an
account.

## Decisions

- **The sections moved into the top row, and the left column was removed.** The word of the owner at
  the analysis of the task about the check against the sample: the look of the application is appointed
  by the sample, and the menu was the only large divergence. Rejected: keeping the left column.
- **There is no panel of the second level — four flat items.** The word of the owner. Rejected: putting
  together a panel with three sections inside — it puts an extra step to every list.
- **The theme was created, and the switch stands in the popup and on the screen of the entry.** The word
  of the owner at the analysis; before that request the second theme counted as not created. The price:
  both themes are now checked by a measurement at every screen.
- **The choice of the language stands both at the entry and in the popup of the profile.** The word of
  the owner. There are two languages, and the second is the built-in English default of the kit: the
  application creates no second dictionary of its own. The price: the screen comes out half bilingual —
  the labels of the admin application are Russian at any choice.
- **The application calls itself by a word, not by a sign.** The word of the owner: the admin
  application has no drawing of a sign, and the place under it on the screen of the entry is taken by
  emptiness. Rejected: drawing the sign ourselves and leaving an empty place until the files appear.
- **The ground of the popup and the strip under the name of the application are painted by the
  application.** The overlay and the wrapper of the header are transparent on purpose: the background is
  given by whoever puts markup into them. Rejected: asking the kit for a ground — it would come to all
  its consumers at once.
- **The stack of the toasts is drawn by the framework.** Rejected: keeping our own and removing the
  built-in one — there is nothing to remove the built-in one by, it is a part of the framework, and a
  second toast in another corner of the screen would appear at every application on the kit.

## Open questions

None.

## History of changes

| Date       | What                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 2026-08-18 | Created by the task RT-783 by the merge of the agreement about the top row                            |
| 2026-08-20 | By the task RT-944 two rules about the background were added: the header and the popup of the profile |
