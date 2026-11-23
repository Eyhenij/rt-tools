# План

**Task:** RT-3485 · **Branch:** RT-3485-ngdoctor-service-decorator
**Behaviour:** unchanged — «Продолжи работу по эпику ng doctor», «Подогнать код»: правка меняет
метку класса `@Injectable({ providedIn: 'root' })` на `@Service()`, класс по-прежнему доступен из
корня; вид и поведение кита, cms, админки и приложений не меняются.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** Angular Doctor находит `prefer-service-decorator` 60 раз: 60 классов, доступных из корня,
  помечены `@Injectable({ providedIn: 'root' })`. Образцы пакета правил и README
  `@rt-tools/store` учат той же метке.
- **Эта задача доводит до:** `prefer-service-decorator` — 0; образцы и README учат `@Service()`;
  снимки витрины прежние.
- **Признак:** вывод `--json` инструмента; `check:ngdoctor` с записанным порогом;
  `node tools/visual-gate.mjs ui-kit-v2`.
- **Точка D эпика:** ни одной info-находки, кроме четвёртой оговорки вехи G. Задача снимает все 60
  находок своего правила; после неё остаются `prefer-signal-forms` (RT-3486, RT-3487) и 11 картинок
  оговорки.
- **Metric:** нет: исправление находок, не правила.

## След задачи

| Что   | Где                                                                                |
| ----- | ---------------------------------------------------------------------------------- |
| Specs | нет: поведение не меняется                                                         |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/code-structure.md` |
| Rules | `.claude/skills/angular-patterns/`, `.claude/skills/typescript-conventions/`       |
| Code  | `projects/`, `libs/`, `apps/`, `tools/eslint-rules/`, образцы пакета правил        |
| Tests | спек правила линтера, спеки затронутых сервисов и хранилищ, снимки витрины         |

## Как идёт работа

- Правило линтера `require-suffix-declaration` принимает метку `@Service` наравне с `@Injectable`;
  его спек получает случай `@Service()` в файле `*.service.ts` с классом не на `Service` — так
  держится `NotificationBus` кита.
- 62 класса в 60 файлах получают `@Service()` вместо `@Injectable({ providedIn: 'root' })`; импорт
  `Injectable` убирается там, где он больше не нужен. Классы с другими свойствами декоратора,
  `@Injectable()` без `providedIn` и NestJS не трогаются.
- Образцы `angular-patterns-state`, `api-layer-pair` и `platform-access-di` в пакете правил
  (`projects/agent-kit/`) учат `@Service()` по правилу `agent-kit-source`, затем раскладка
  `pnpm run agent-kit:sync`. README `@rt-tools/store`, тестовое хранилище
  `admin-list-screen.base.spec.ts` и сервис витрины в `projects/ui-kit-v2/.storybook/preview.ts` —
  тоже; описание шины уведомлений в `toast/CONTEXT.md` называет `@Service()`. Образец `entity-store` остаётся на `@Injectable()`: его хранилище даётся списком
  провайдеров экрана, а `@Service()` сделал бы его общим на всё приложение.
- Порог `check:ngdoctor` пишется заново командой `node tools/check-ngdoctor.mjs --write`.
- Вид кита не меняется: файлы кита, которые считает проверка согласий, — десять сервисов и
  хранилищ из `projects/ui-kit-v2/src`; в каждом меняется только метка класса и импорт.

## Что считается сделанным

`prefer-service-decorator` — 0, образцы и README без `@Injectable({ providedIn: 'root' })`, порог
записан, снимки витрины прежние, тесты, линт, типы и сборка затронутых проектов зелёные — сборка
пакетов проверяет `@Service` компилятором Angular, которого нет в тестах и проверке типов; предел
длины файлов не нарушен.

## Этапы

### 1. Метка @Service для синглтонов

- **Steps:**
    1. Правило линтера принимает метку Service
       Check: `sh -c 'pnpm exec nx test eslint-rules -- rules/require-suffix-declaration.spec.ts >/dev/null 2>&1 || { echo red; exit 0; }; grep -c "@Service()" tools/eslint-rules/rules/require-suffix-declaration.spec.ts'` → >= 1
    2. Классы шестидесяти файлов помечены Service
       Check: `sh -c 'pnpm run -s ngdoctor --json 2>/dev/null | node -e "let s=\"\";process.stdin.on(\"data\",(d)=>{s+=d}).on(\"end\",()=>{try{console.log(JSON.parse(s).diagnostics.filter((x)=>x.ruleId===\"angular-doctor/prefer-service-decorator\").length)}catch{console.log(\"red\")}})"'` → = 0
    3. Образцы правил и README учат Service
       Check: `sh -c 'grep -l "@Injectable({ providedIn: .root. })" projects/agent-kit/assets/patterns/*.md projects/store/README.md libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.spec.ts projects/ui-kit-v2/.storybook/preview.ts | wc -l | tr -d " "'` → = 0
    4. Порог записан, снимки витрины прежние, тесты, линт, типы и сборка затронутых проектов зелёные
       Check: `sh -c 'node tools/check-file-size.mjs >/dev/null 2>&1 || { echo red; exit 0; }; pnpm exec nx affected -t lint typecheck test build --base=origin/RT-3484-ngdoctor-document-image >/dev/null 2>&1 || { echo red; exit 0; }; node tools/check-ngdoctor.mjs >/dev/null 2>&1 || { echo red; exit 0; }; node -e "console.log(require(\"./tools/ngdoctor-threshold.json\").rules[\"angular-doctor/prefer-service-decorator\"] ?? 0)"'` → = 0
- **Readiness sign:** правила `prefer-service-decorator` в выводе инструмента нет; `check:ngdoctor`
  зелёный на новом пороге; снимки витрины прежние.
- **Verified by:** признаки шагов; снимки витрины `node tools/visual-gate.mjs ui-kit-v2` перед
  шагом 4; живая проверка — экраны с затронутыми сервисами открываются и ведут себя как прежде:
  витрина кита (тема, уведомления, боковая панель, окно), админка на стенде
  `pnpm run serve:stand` (списки, карточки записей, заголовок вкладки).

## Что эта работа не делает

- Не трогает `@Injectable()` без `providedIn: 'root'` — хранилища cms, образец `entity-store`, —
  классы с другими свойствами декоратора и NestJS: правило их не судит, а такие классы даются через
  списки провайдеров.
- Не меняет вид: смена метки класса вида не касается.
