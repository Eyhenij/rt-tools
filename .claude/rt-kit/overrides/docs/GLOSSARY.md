## Kits and showcase

- **Kit** — a package of components that ships to a consumer. There are two, `@rt-tools/ui-kit` and `@rt-tools/ui-kit-v2`; they are kept apart on purpose and share no code at all
- **Showcase** — the stand where the components of a kit are shown live. Each kit has its own, with its own port and its own harness; a technique taken from one is silently wrong on the other
- **Story** — one showing of a component on the showcase: the set of inputs under which it is drawn. Not a "case"
- **Wrapper** — a demonstration component next to a story. Holds the mutable state that a signal input of the kit cannot be given, and does not ship in the package
- **Axis** — one input of a component with all its values. A component is covered when every axis is shown in full, not when a value can be reached with a control
- **Matrix** — a showing in which the values of an axis are laid side by side and labelled. Axes are multiplied only where they visibly affect one another
- **Snapshot** — a frame of a story compared with its baseline. Answers "does it look the same as before" and says nothing about why it differs
- **Baseline** — the pinned frame a snapshot is compared with. Taken after the frame has been looked at with the eyes, and re-taken one at a time
- **Story sweep** — a run that opens every story and checks that the frame holds anything at all. Green snapshots do not answer this: an empty frame has become its own baseline
- **Token** — a styling variable `--rt-*`. Styling is taken by token, not by a value in place. A token of access to anything is called by its full name; the short word means styling only

## Incident review

- **Incident** — a session in which the executor did the wrong thing and the rules layer did not refuse it. A defect in code is not an incident: a test explains it
- **Postmortem** — a record of an incident in the cargo intake: the mechanism of the miss step by step, what was available before it, what caught it and what of this went into the rules layer
- **Mechanism** — a sequence that can be repeated: what was taken for granted, where it was taken from, what confirmed it. Written instead of an assessment of the executor: the rule is derived from it

## Domains of this tree

A domain here is a package under `projects/` or an application under `apps/`, and its spec lies
in `docs/specs/<domain>/`. A part of a package does not become a domain of its own: it is a
subdomain.

- **Public entry** — the `public-api.ts` file of a package. A symbol the consumer has no road to from here is not delivered, whatever it is marked in the source
- **Consumer** — an application that installed the package from the registry. It is not in the tree, and an edit cannot be checked on it: hence the showcase and the snapshots
- **Release** — sending a package to the registry. A separate decision of the owner, not the tail of the work: merging a package PR publishes nothing

## Cargo intake

- **Intake** — the service that accepts cargo from trees where the rules layer is installed. Closed: without a tree token it returns nothing but a liveness probe. The word "intake" also names the action of accepting cargo: the service is the intake, the action is an intake operation
- **Cargo** — what leaves a tree in one send run: the digest of observations with the override snapshot, the proposals and the incident reviews
- **Cargo kind** — one of three: digest, proposals, reviews. Each has its own intake operation: a common "accept anything" would push the parsing of the form onto the intake
- **Tree** — the repository the cargo comes from. Two working copies of one repository are one tree: trees are counted, not machines and not people
- **Tree mark** — the short value by which a tree names itself in the cargo. Computed as a hash of the repository address: the address cannot be recovered from it
- **Tree token** — what a tree presents itself with to the intake. The intake keeps only the hash; the token itself is printed once, at issue, and there is nowhere to show it a second time
- **Token revocation** — a note that the token is no longer accepted. The token is not deleted: the earlier cargo is read by it
- **Invitation** — a one-time code issued by the owner for one tree. By it the tree gets a token once; after that the invitation goes out
- **Token request** — what a tree asks for a token with: the invitation and the tree mark. There is no name in it; the intake takes the name from the invitation. Not called a PR: the PR here is one thing, the request to merge
- **Month record** — the summary of one tree for one calendar month. One per pair "tree and month": found, it is appended to; not found, it is created
- **Override snapshot** — the state of a tree at the moment of sending: which sections of which package resources it replaces, adds and removes. The content of the edits is not in it
- **Unselected** — a package resource the tree did not lay out at all. Declining a resource is as much an answer about the package text as editing its section

## Intake admin

- **Admin** — the application with which a person reads the accepted cargo. There are no cargo edits in it at all: the intake accepts, the admin reads
- **Account** — the name and password of one person. Created, changes its password and is disabled by the command line of the intake launcher; accounts are not created from the web
- **Sign-in** — the state in which the intake knows who is asking. Lives for a term, ends with a sign-out and does not replace the tree token
- **Section** — a screen of the admin with an address of its own. A menu item leads into a section, and the item is created together with its screen
- **List** — the page of a section: a row per record, a toolbar above it and a page switch below it. Assembled with the kit table, not with markup of its own
- **Toolbar** — the strip above the list: filter, search and actions on the list as a whole. There are no actions on a single record in it
- **Details panel** — a panel with one record in full, sliding out on a click on the row. Not a "modal" and not a "popup"
- **Filter** — a condition that narrows the list. It narrows what is shown, not the access: a signed-in person sees the cargo of all trees
- **Query** — the page, its size, the order and the filter together. Lives in the section address so that it survives a reload and can be passed as a link

## Russian names of this tree

The same table as "Russian names" above, for the words of this tree: one Russian name per
English one when a session writes to the owner.

| English           | Russian              |
| ----------------- | -------------------- |
| account           | учётная запись       |
| admin             | админка              |
| axis              | ось                  |
| baseline          | эталон               |
| cargo             | груз                 |
| cargo kind        | род груза            |
| consumer          | потребитель          |
| details panel     | панель подробностей  |
| filter            | отбор                |
| incident          | происшествие         |
| intake            | приёмник             |
| invitation        | приглашение          |
| kit               | кит                  |
| list              | список               |
| matrix            | матрица              |
| mechanism         | механизм             |
| month record      | запись месяца        |
| override snapshot | снимок надстроек     |
| postmortem        | постмортем           |
| public entry      | публичный вход       |
| query             | выборка              |
| release           | выпуск               |
| section           | раздел               |
| showcase          | витрина              |
| sign-in           | вход                 |
| snapshot          | снимок               |
| story             | история              |
| story sweep       | обход историй        |
| token             | токен                |
| token request     | обращение за токеном |
| token revocation  | отзыв токена         |
| toolbar           | тулбар               |
| tree mark         | признак дерева       |
| tree token        | токен дерева         |
| unselected        | невыбранное          |
| wrapper           | обёртка              |
