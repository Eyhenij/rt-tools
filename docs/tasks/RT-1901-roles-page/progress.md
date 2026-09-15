# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 4 of 4 — the texts and the closing
- **Done:** stage 1 — the receiver (build green, 69 + 38 tests); stage 2 — the admin panel: the
  dictionary, right labels by section, `RolesStore`, the access calls of `PeopleStore`, the
  screens `roles-list`, `role-aside`, `access-aside`, the routes, the item "Роли", the item
  "Права" of the people row, the boundaries; build, layers, dupes and lint green, 6 + 4 + 12 tests;
  stage 3 — the suite: the section `roles` in the support, `roles.spec.ts` with SC-MB-371…378 and
  382, the frames `roles-list` and `person-access-panel`, eleven frames re-taken for the seventh
  item; 121 passed
- **Next step:** the agreement merged into the domain with the companion, the archive record, the
  folder taken apart by the last commit, the push, the PR into the epic branch
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **The roles stay in the `accounts` domain on both sides.** A domain of its own would be six libs
  for two screens and a store; the receiver already reads the role of an account there. Affected
  stage of the plan: 1, 2.
- **The choice "without a role" is an empty string, not `null`.** The kit select reads `null` as
  "nothing chosen" and shows the placeholder in place of the word; the suite caught the panel of a
  roleless person showing an empty field. The panel translates the empty string into `null` for
  the receiver. Affected stage: 2, found in 3.
- **The rights cell of the roles list wraps under a width limit.** The table takes its width by
  content for the sideways scroll, and the rights of the owner role pushed the people column off
  the screen. The limit and the wrap live in the shared page layer as `admin-page__cell-wrap`, and
  the screen applies them by the block directive. Affected stage: 2, found in 3.

## Sessions

### 2026-09-15

- The epic branch got main merged in (ten frames re-taken, 112 green) and the renumbering of
  SC-MB-359 → SC-MB-370 after a collision with main; both pushed.
- The task branch, the folder, the agreement and the plan.
- The receiver, the admin panel and the suite; two screen defects found by the frames and fixed.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-worktree-2
**Branch:** RT-1901-roles-page

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — the end-to-end suite
- **Next step:** the section `roles` in the suite support, `roles.spec.ts` with SC-MB-371…378,
- **PR:** not open yet

The progress in full — `docs/tasks/RT-1901-roles-page/progress.md`; the plan lies next to it.

### Uncommitted

```
 M apps/message-bus-admin-e2e/src/people-list.spec.ts
 M apps/message-bus-admin-e2e/src/support/admin.ts
 M apps/message-bus-admin-e2e/stand/stand.mjs
?? docs/tasks/RT-2041-ambiguous-names-unwired/
```

### Commits over the main branch

```
f93a2f434 feat(rt:message-bus): раздел «Роли» и панель прав пользователя в админке
a14f786ca feat(rt:message-bus): приёмник заводит, правит и удаляет роли и меняет доступ человека под правом на роли
807cd6cc3 docs(rt:message-bus): папка задачи RT-1901 заведена, договорённость о странице ролей записана
cdb94c0b7 test(rt:message-bus): сцена переноса прав получила номер SC-MB-370 после столкновения с главной веткой
c05ac64dc Merge remote-tracking branch 'origin/main' into RT-1896-access-rights
03ae16905 Merge remote-tracking branch 'origin/main' into RT-1896-access-rights
af8385f72 [RT-1900] Папка чужой задачи убрана из ветки эпика (#2144)
c53c3a66f [RT-1900] Пользователя заводят, отключают и меняют ему пароль с экрана (#2140)
31b719513 docs(rt:message-bus): папка чужой задачи RT-2041 убрана из ветки
244ec91fa docs(rt:message-bus): папка задачи RT-1900 разобрана
b637d3321 test(rt:message-bus): правки над людьми закрыты сквозным набором, договорённость влита в описание домена
422028912 feat(rt:message-bus): пользователя заводят, отключают и меняют ему пароль с экрана списка
f6652992f feat(rt:message-bus): приёмник заводит, отключает и меняет пароль людям под правом на правку
6b5f508bf docs(rt:message-bus): договорённость о заведении, отключении и новом пароле записана до кода
7af6f964e docs(rt:message-bus): папка задачи RT-1900 заведена, план записан
0f3ef930f test(rt:message-bus): порядок людей читается после прихода строк, а не по видимой таблице
6c983d6c9 docs(rt:agent-kit): просроченные записи описания прошлого убраны из дерева
17a9f314a Merge remote-tracking branch 'origin/main' into RT-1896-access-rights
7b5f90303 docs(rt:message-bus): план эпика RT-1896 получил строку задачи RT-2134
5d49f0c26 [RT-2134] Раздел учётных записей называется «Пользователи» (#2135)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
