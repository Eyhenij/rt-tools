# План

**Task:** RT-3484 · **Branch:** RT-3484-ngdoctor-document-image
**Behaviour:** unchanged — «Продолжи работу по эпику ng doctor», «Подогнать код»: правка меняет
имена полей и способ взять `document`, вид и поведение кита, cms и темы входа не меняются.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** Angular Doctor находит `prefer-document-token` 29 раз и `prefer-ng-optimized-image`
  13 раз; 24 находки первого правила — поле `#document`, уже взятое через `inject(DOCUMENT)`.
- **Эта задача доводит до:** `prefer-document-token` — 0; `prefer-ng-optimized-image` — 11, только
  настоящие картинки, каждая с названной причиной; снимки витрины прежние.
- **Признак:** вывод `--json` инструмента; `check:ngdoctor` с записанным порогом;
  `node tools/visual-gate.mjs ui-kit-v2`.
- **Точка C эпика:** правил RT-3478…RT-3483 нет, кроме оговорок G; **точка D:** ни одной
  info-находки. Задача снимает 31 из 42 находок своих правил; 11 находок картинок остаются в
  пороге: пять неприменимы навсегда (`data:`, `blob:`, свой `srcset`), шесть переводимых — новый
  эпик по слову владельца о больших изменениях. Веху G задача не меняет.
- **Metric:** нет: исправление находок, не правила.

## След задачи

| Что   | Где                                                                      |
| ----- | ------------------------------------------------------------------------ |
| Specs | нет: поведение не меняется                                               |
| Laws  | `docs/constitution/frontend-application.md`                              |
| Rules | `.claude/skills/platform-access/`, `.claude/skills/component-structure/` |
| Code  | `projects/` — кит, core, cms, тема входа, образец пакета правил          |
| Tests | спеки затронутых компонентов, снимки витрины                             |

## Как идёт работа

- Поле `readonly #document: Document = inject(DOCUMENT)` переименовывается в `#doc` во всех файлах
  дерева, с находкой и без; спеки, которые обращаются к полю, — тоже.
- Образец правила `platform-access-di` в пакете правил (`projects/agent-kit/`) получает имя `#doc`
  по правилу `agent-kit-source`, затем раскладка `pnpm run agent-kit:sync`.
- Директива `scroll-to-element` в core и четыре обёртки витрины `rich-editor` берут
  `inject(DOCUMENT)` вместо глобального `document`.
- Примеры в комментариях `rt-side-menu.directives.ts` и `rt-toggle-button-option.directive.ts`
  пишутся без тега `<img`.
- Картинки на `NgOptimizedImage` не переводятся: пять неприменимы навсегда, шесть требуют правки
  вёрстки.
- Порог `check:ngdoctor` пишется заново командой `node tools/check-ngdoctor.mjs --write`.
- План эпика получает строку о новом эпике для шести переводимых картинок; его карточка и план, где
  названы и пять неприменимых, заводятся в этой же работе со второго рабочего дерева на главной
  ветке.

## Что считается сделанным

`prefer-document-token` — 0, `prefer-ng-optimized-image` — 10, порог записан, снимки витрины
прежние, тесты, линт и типы затронутых проектов зелёные, предел длины файлов не нарушен.

## Этапы

### 1. Токен DOCUMENT и картинки с известным размером

- **Steps:**
    1. Поле #document переименовано, пять глобальных document берут токен DOCUMENT
       Check: `sh -c 'pnpm run -s ngdoctor --json 2>/dev/null | node -e "let s=\"\";process.stdin.on(\"data\",(d)=>{s+=d}).on(\"end\",()=>{try{console.log(JSON.parse(s).diagnostics.filter((x)=>x.ruleId===\"angular-doctor/prefer-document-token\").length)}catch{console.log(\"red\")}})"'` → = 0
    2. Примеры в комментариях без тега img
       Check: `sh -c 'pnpm run -s ngdoctor --json 2>/dev/null | node -e "let s=\"\";process.stdin.on(\"data\",(d)=>{s+=d}).on(\"end\",()=>{try{console.log(JSON.parse(s).diagnostics.filter((x)=>x.ruleId===\"angular-doctor/prefer-ng-optimized-image\").length)}catch{console.log(\"red\")}})"'` → = 11
    3. Порог записан, снимки витрины прежние, тесты, линт и типы затронутых проектов зелёные
       Check: `sh -c 'node tools/check-file-size.mjs >/dev/null 2>&1 || { echo red; exit 0; }; pnpm exec nx affected -t lint typecheck test --base=origin/RT-3476-angular-doctor >/dev/null 2>&1 || { echo red; exit 0; }; node tools/visual-gate.mjs ui-kit-v2 >/dev/null 2>&1 || { echo red; exit 0; }; node tools/check-ngdoctor.mjs >/dev/null 2>&1 || { echo red; exit 0; }; node -e "console.log(require(\"./tools/ngdoctor-threshold.json\").rules[\"angular-doctor/prefer-document-token\"] ?? 0)"'` → = 0
- **Readiness sign:** обоих правил в выводе инструмента нет, кроме одиннадцати картинок с причинами;
  `check:ngdoctor` зелёный на новом пороге; снимки витрины прежние.
- **Verified by:** признаки шагов; живая проверка — затронутые истории витрины (боковая панель,
  нижний лист, выдвижная панель, окно, кадрирование, загрузка картинки, просмотрщик PDF, панель
  инструментов, чат) открываются и ведут себя как прежде.

## Что эта работа не делает

- Не переводит на `NgOptimizedImage` одиннадцать картинок: пять нельзя (`data:`, `blob:`, свой
  `srcset`), шесть переводимых требуют правки вёрстки — новый эпик.
- Не меняет вид: правка кита без смены вида идёт по слову владельца «вид не меняется».
