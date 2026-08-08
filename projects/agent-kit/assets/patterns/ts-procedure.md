---
name: ts-procedure
kind: pattern
rule: typescript-conventions
description: Паттерн правила typescript-conventions. Брать при заведении или правке процедуры Connect на бэкенде — готовый класс с полем method и методом handle, зависимости конструктором, имя файла и класса, почему форма именно такая. Не брать для объявления доступа к процедуре — это паттерн permissions-procedure.
---

# Процедура Connect

Паттерн правила `typescript-conventions`. Что при этом должно быть верно — закон
`docs/constitution/code-structure.md`.

## Когда брать

- Заводится новая процедура бэкенда.
- Правится тело существующей.
- Домен переезжает на вертикальную нарезку.

## Одна процедура — один класс

Файл `<процедура>.procedure.ts` в слое `feature` своего домена, класс `<Процедура>Procedure`,
публичное поле `method` с дескриптором из контракта и публичный метод `handle` с телом.
Зависимости приходят конструктором — на бэкенде DI нестовский, `inject()` там нет.

```typescript
@Injectable()
@ConnectProcedure()
@RequiresPermission('bookings:manage')
export class PingProcedure implements IConnectProcedure<typeof HealthService.method.ping> {
    readonly #health: HealthCheckService;

    public readonly method: typeof HealthService.method.ping = HealthService.method.ping;

    constructor(health: HealthCheckService) {
        this.#health = health;
    }

    public async handle(): Promise<{ status: EHealthStatus }> {
        return { status: (await this.#health.check()).status };
    }
}
```

Объявление доступа обязательно, и оно ровно одно — паттерн `permissions-procedure`.

## Почему форма такая

Прежняя — `register(router)` с телами в замыканиях внутри `router.service(...)` — делала
обработчик недостижимым для спеки: наружу торчал только класс с методом `register`. А
`router.service` заглушает каждый непереданный метод ответом `Unimplemented`, поэтому один
proto-сервис не мог обслуживаться двумя доменами.

Класс решает и то, и другое: `handle` зовётся спекой напрямую, а реестр кладёт процедуры
поштучно через `router.rpc`.

## Частые промахи

- Третий суффикс: `*.rpc.ts` и `*.connect.ts` — прежние имена, они уходят вместе с последним
  переехавшим доменом, и новых таких файлов не заводится.
- `inject()` в классе процедуры: на бэкенде зависимости идут конструктором.
- Тело в замыкании внутри регистрации роутера: спека до него не дотянется.
- Процедура без объявления доступа: приложение не поднимется.
- Приведение `as` в переводе моделей: на бэкенде оно запрещено так же, как в маппере фронта.
- Свой тип у результата `groupBy` Prisma: он условный, собирается из аргументов вызова и с
  выписанным руками не сходится. Там, где ключей единицы, идёт `count` на ключ в `Promise.all`.
