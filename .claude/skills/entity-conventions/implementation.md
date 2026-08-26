# entity-conventions — что здесь своё

Имена и привязки этого дерева при правиле `SKILL.md` рядом.

Панелей правки записи здесь нет ни одной, и не будет: груз читается, а не правится — приёмник
принимает его от деревьев. Записывающая панель одна, и она заводит запись, а не правит:
панель выдачи приглашения в разделе приглашений. Панелей подробностей три, по одной на раздел
груза, и все они стоят на той же основе кита, что и панель правки: маршрут в аутлете `ro`,
чтение записи по идентификатору из адреса, закрытие навигацией. Поэтому статьи про запись
держит одна панель выдачи, а остальные панели верны буквой основы.

## Как это называется здесь

- **В правиле** — Здесь
- **асайд с `outlet: 'ro'`** — он же; сам компонент боковой панели — `rt-aside` из `@rt-tools/ui-kit-v2`
- **`RtRouteAsideComponent<T>`** — он же: директива без селектора в ките, `rt-route-aside.base.ts`
- **`BaseListStoreService`** — здесь такого нет; ближайшее — `BaseAsyncStoreService` из `@rt-tools/store`
- **`runMutation`** — он же — метод основы
- **`pristineSignal(control)`** — он же — из той же основы
- **`openRelated`** — он же — метод основы
- **стор сущности** — `<сущность>.store.ts` в `<домен>/data-access` — по два на раздел груза

## Где это лежит

- **общая основа панели маршрута** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts`
- **боковая панель** — `projects/ui-kit-v2/src/lib/components/aside/`
- **основы сторов** — `projects/store/src/lib/` — `BaseStoreService`, `BaseAsyncStoreService`
- **шина оповещений** — `projects/ui-kit-v2/src/lib/platform/notification-bus.service.ts`
- **стор входа** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts` — вход, не сущность
- **общая основа списочного стора** — `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts`
- **сторы разделов** — `libs/message-bus-admin/postmortems/data-access/`, `.../proposals/data-access/`, `.../summaries/data-access/` — список и запись порознь
- **панели подробностей** — `libs/message-bus-admin/postmortems/feature/details-aside/`, `.../proposals/feature/details-aside/`, `.../summaries/feature/details-aside/`
- **панель, заводящая запись** — `libs/message-bus-admin/invites/feature/create-aside/` — выдача приглашения: поле имени, `runMutation`, показ кода
- **сквозные спеки панели** — `apps/message-bus-admin-e2e/src/postmortems-list.spec.ts`, `apps/message-bus-admin-e2e/src/sections.spec.ts`, `apps/message-bus-admin-e2e/src/invites-list.spec.ts`

## Где исполняются статьи

Первая колонка — статья дословно, как она написана в разделе «Как закон применяется здесь»
(жирная часть пункта). Статья без строки и строка без статьи — расхождение: правило обещает то,
чего в дереве нет, либо в дереве стоит то, о чём правило молчит.

- **Асайд открывается маршрутом в аутлете `ro`, а не вызовом сервиса.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:RtRouteAsideComponent` — основа кита читает запись по идентификатору из адреса и закрывается навигацией. Все три панели админки открываются маршрутом — `libs/message-bus-admin/postmortems/shell/src/lib/postmortems.routes.ts:postmortemsRoutes`, и уход в панель идёт из общей механики экрана: `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:openDetails`.
- **Запись идёт через `runMutation`, и панель отдаёт основе поток мутации и ключи.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:runMutation` — занятость, гашение прежней ошибки, тост об успехе и закрытие держит основа. Зовёт её одна панель дерева — `libs/message-bus-admin/invites/feature/create-aside/src/lib/admin-invite-create-aside.component.ts:submit`, и закрытия она у основы не просит: код виден только в открытой панели.
- **Поток мутации обязан отдать значение или ошибку.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:submitting` — признак записи снимается ответом потока; пустой поток оставил бы его поднятым навсегда, и закрыть панель стало бы нечем.
- **Мутация завершается перечитанным списком, а не отправленным запросом.** — Груз админка не правит вовсе; мутации у неё две, и обе над приглашением — выдача и отзыв. Обе кончаются перечитанным списком: `libs/message-bus-admin/invites/data-access/src/lib/invites.store.ts:issue` и `:revoke` зовут `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts:retry` ответом, а не отправленным запросом.
- **Стор отвечает потоком: успех — значение, отказ — ошибка потока.** — Сторы разделов отвечают сигналами, а не потоком, и законно: читающий стор ничего не возвращает вызывающему — экран смотрит на `rows`, `pending` и `fault` (`libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts:AdminListStoreBase`). Стор входа — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts:AuthStore` — отвечает наполовину иначе, и законно: вход ничего не возвращает, потому что у него источник действия и `exhaustMap`, и второе нажатие кнопки не заводит второго запроса; результат читается сигналами `session` и `fault`. Потоком отвечают `restore` и `signOut` — их зовут гвард и оболочка, а не форма. Потоком со значением отвечает и выдача приглашения — `libs/message-bus-admin/invites/data-access/src/lib/invites.store.ts:issue`: код приезжает ответом, и панели взять его больше неоткуда. Булева ответа в дереве нет нигде.
- **Имена берутся от сущности, а не от домена.** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts:signIn` — рядом `signOut` и `restore`: имя домена стоит в имени стора, и повторять его в методах нечем.
- **Гард несохранённых правок ставит сама панель и на все четыре пути закрытия.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:guardUnsavedChanges` — четыре пути закрытия держит основа кита; своей проверки панель не заводит. Ни одна панель админки его не ставит. У панелей подробностей правок нет вовсе; у панели выдачи приглашения поле одно, и несохранённым в ней бывает только набранное и не выданное имя.
- **Уход из панели идёт через `openRelated`, а не своим `router.navigate`.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:openRelated` — абсолютные команды оставляют аутлет `ro` в адресе, и роутер отклоняет навигацию молча.
- **Запись читается по идентификатору из адреса полной моделью, а не берётся из списка.** — `libs/message-bus-admin/postmortems/data-access/src/lib/postmortem.store.ts:PostmortemStore` — панель читает запись своей операцией по идентификатору из адреса, а не берёт строку из списка: текста разбора в строке нет вовсе. Уровни модели — `libs/message-bus-admin/postmortems/util/src/lib/postmortem.model.ts:IPostmortem`.

## Что ещё стоит знать при чтении кода

- Общая основа списочного стора здесь своя — `AdminListStoreBase` в `common/core/data-access`, а
  не `BaseListStoreService` из правила: она стоит на `BaseAsyncStoreService` кита и знает ровно
  то, что нужно читающему списку — страницу, занятость и род отказа.
- Стор входа сущностью не заведует, и правило на нём не действует: гейт уводит всё поддерево
  `libs/message-bus-admin/auth/` в общие правила — ветка в `.claude/rt-kit/gate-map.sh`.
- Основа панели живёт в ките, который пишет это же дерево. Правка, которой панели не хватает,
  идёт в основу, а не в панель: вторая панель со своей механикой разойдётся с первой молча.
- Действие со своей занятостью через основу не идёт — у него свой признак; в дереве такого
  действия пока нет.

## Чем это проверяется

- `pnpm exec nx test @rt-tools/ui-kit-v2` — спеки основы панели маршрута: `runMutation`,
  `openRelated`, нетронутость формы, четыре пути закрытия.
- `pnpm exec nx test message-bus-admin-auth-util` — спеки разбора отказа входа.
- `pnpm exec nx run message-bus-admin-e2e:e2e` — сквозной набор: панель открывается нажатием на
  строку, закрытая возвращает список тем же, а записи, которой нет, панель говорит об этом.
- Гейт правил требует это правило на сторах админки и на панелях правки — ветка в
  `.claude/rt-kit/gate-map.sh`.
