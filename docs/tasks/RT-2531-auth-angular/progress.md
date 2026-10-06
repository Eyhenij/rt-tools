# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 6 — Описание поддомена клиента
- **Done:** разбор и план
- **Next step:** описание поддомена `docs/specs/auth/angular/`
- **Uncommitted:** нет
- **Waiting for the owner:** нет
- **PR:** not open yet

## Steps

- [>] 1.1 Написать `spec.md`, `scenarios.md` и `implementation.md` в `docs/specs/auth/angular/`
- [ ] 1.2 Назвать поддомен в описании доменов
- [ ] 2.1 Завести проект `projects/auth-angular` со сборкой ng-packagr и Jest
- [ ] 2.2 Подключить `keycloak-js` и контракт
- [ ] 3.1 Написать подключение `provideRtAuth` и службу сессии с сигналами
- [ ] 3.2 Положить в пакет страницу тихой проверки входа
- [ ] 4.1 Написать перехватчик HttpClient: токен, заголовок организации, один повтор после 401
- [ ] 4.2 Написать перехватчик Connect с тем же поведением
- [ ] 5.1 Написать проверки маршрутов по входу и по праву
- [ ] 5.2 Написать директиву показа по праву
- [ ] 6.1 Написать README пакета
- [ ] 6.2 Дописать решения задачи в план эпика

## Decisions along the way

Пока нет.

## Sessions

### 2026-10-06

- Ветка от ветки эпика, разбор и план.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-2531-auth-angular

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 6 — Описание поддомена клиента
- **Next step:** описание поддомена `docs/specs/auth/angular/`
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2531-auth-angular/progress.md`; the plan lies next to it.

### Uncommitted

```
AM docs/tasks/RT-2531-auth-angular/grill.md
AM docs/tasks/RT-2531-auth-angular/plan.md
AM docs/tasks/RT-2531-auth-angular/progress.md
```

### Commits over the main branch

```
2ddff571d Merge remote-tracking branch 'origin/RT-2528-auth-module' into RT-2528-auth-module
508568e34 Merge remote-tracking branch 'origin/main' into RT-2528-auth-module
548fee09b [RT-2537] Проверка привязок видит функции, которые пакет отдаёт через .js (#2541)
a9fa2addf docs: папка задачи RT-2537 разобрана
b69b9f7fe fix(rt:agent-kit): проверка привязок видит файлы, которые баррель подключает через .js
cc8539bbb docs: папка задачи RT-2537
c4f8d3616 [RT-2533] Права и вызывающий читаются из токена одним пакетом (#2538)
e11a3ded1 [RT-2529] Стенд Keycloak поднимается одной командой (#2536)
1632631c0 chore(rt:auth): @rt-tools/auth-contract 0.1.0 к первой публикации
41217c0dc refactor(rt:auth): контракт под общим с utils запретом фреймворков
14373c233 docs: папка задачи RT-2533 разобрана
107550d93 feat(rt:auth): пакет @rt-tools/auth-contract — права и вызывающий
8a0a87531 docs: папка задачи RT-2533 и описание контракта модуля входа
b56e20d2b docs: папка задачи RT-2529 разобрана
bcf4e9b34 docs: спек домена auth — стенд Keycloak
092d15a3a feat: стенд Keycloak модуля входа и его проверка
e7855cffb docs: папка задачи RT-2529 и договорённость о стенде Keycloak
59c0889c6 docs: записи архива старше недели удалены
c3f598c25 docs: план эпика RT-2528 — модуль входа на Keycloak
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
