# Разбор

## Просьба владельца

> Продолжи работу по эпику ng doctor

Просьба эпика RT-3476, задача 10 плана эпика. Карточка RT-3485: находка `prefer-service-decorator`
(59), «Angular 22 даёт `@Service` для синглтонов»; признак — Angular Doctor не находит правила,
сборка и тесты зелёные.

## Что уже есть в дереве

- `prefer-service-decorator` в Angular Doctor 0.3.0 находит файл `.ts`, где вне комментария стоит
  `@Injectable({ … providedIn: 'root' … })`, — одна находка на файл
  (`node_modules/@abiramcodes/angular-doctor/dist/cli.js`, `rulePreferServiceDecorator`). Сегодня
  находок 60: `libs/message-bus-admin` — 28, `projects/cms-angular` — 17, `projects/ui-kit-v2` —
  10, `projects/core` — 2, `apps/chat-talks-page` — 2, `apps/auth-example-admin` — 1.
- `@Service` есть в установленном `@angular/core` 22.2.2 (`types/core.d.ts`, `ServiceDecorator`):
  `@Service()` — класс сам доступен из корня, как `providedIn: 'root'`; `{ autoProvided: false }` —
  только из списка провайдеров. Все пакеты дерева требуют `@angular/core` `^22.0.0`, так что
  потребитель получает `@Service` вместе с пакетом.
- Angular даёт миграцию `@angular/core:service`
  (`node_modules/@angular/core/schematics/bundles/service-migration.cjs`): она меняет
  `@Injectable()` и `@Injectable({ providedIn: 'root' })` на `@Service()` и пропускает класс, у
  которого есть другие свойства декоратора или конструктор с параметрами в цепочке наследования.
  У всех 60 классов декоратор — только `{ providedIn: 'root' }`, параметров конструктора нет: 21
  хранилище наследует базу хранилищ с собственным конструктором без параметров, стратегия
  заголовка админки наследует `TitleStrategy` роутера.
- Собственное правило линтера `require-suffix-declaration`
  (`tools/eslint-rules/rules/require-suffix-declaration.ts`, `PROMISES.service`) обещает в файле
  `*.service.ts` метку `@Injectable` или класс с именем на `Service`. Три класса держатся только
  меткой: `NotificationBus` (`notification-bus.service.ts` кита), `MediaApiFacade` и
  `MediaFoldersApiFacade` (`api/*.service.ts` cms). С `@Service` правило их отвергнет.
- Образцы пакета правил учат писать `@Injectable({ providedIn: 'root' })`:
  `patterns/angular-patterns-state.md`, `patterns/api-layer-pair.md`,
  `patterns/platform-access-di.md`; `patterns/entity-store.md` — `@Injectable()`. README пакета
  `@rt-tools/store` — три примера. Код по ним снова даёт находку. `patterns/ts-procedure.md` — это
  NestJS, там `@Injectable` свой.
- Тестовое хранилище `admin-list-screen.base.spec.ts` тоже на `@Injectable({ providedIn: 'root' })`
  — спеки инструмент не читает.

## Что уже говорят правила

- Находки, которые спорят с соглашениями дерева, — «Подогнать код» (решение владельца 21.11.2026,
  план эпика); info-миграции — «Все четыре», среди них `@Service`.
- Большие изменения в этом эпике не делаются — слово владельца 23.11.2026.
- Образец, по которому код снова даёт находку, правится в пакете правил — так сделано в RT-3484.
- Нужны ли макеты, исполнитель решает сам — слово владельца 23.11.2026. Смена декоратора вида не
  касается.

## Вопросы и ответы

Вопросов нет: карточка, решения владельца по эпику и код отвечают на всё.

## Решения

- **Все 60 классов получают `@Service()` вместо `@Injectable({ providedIn: 'root' })`.** Поведение
  то же: класс доступен из корня. Импорт `Injectable` убирается, где он больше не нужен.
- **Правило линтера `require-suffix-declaration` принимает метку `@Service` наравне с
  `@Injectable`.** Иначе три класса с именем не на `Service` станут красными.
- **Образцы пакета правил и README `@rt-tools/store` учат `@Service()`.** Тестовое хранилище спеки
  — тоже, чтобы образец и код не расходились.
- **`@Injectable` без `providedIn: 'root'` и NestJS не трогаются.** Правило их не судит.
  Отвергнуто: менять все `@Injectable` — это классы, которые даются через списки провайдеров.

**Описание фичи:** не нужно — правка не меняет поведения приложения.

## Что осталось неясным

- Ничего, что держит работу.
