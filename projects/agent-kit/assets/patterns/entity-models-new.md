---
name: entity-models-new
kind: pattern
rule: entity-models
description: Паттерн правила entity-models. Брать при объявлении новой модели сущности и её маппера — готовый неймспейс I<Сущность> с Api, State и Draft, короткий и полный уровни, наследник BaseMapper с typeCast, что делать после правки .proto.
---

# Объявить модель сущности и её перевод

Паттерн правила `entity-models`. Что при этом должно быть верно — закон
`docs/constitution/entity-models.md`.

## Когда брать

- Заводится новая сущность админки.
- У существующей появляется короткий уровень.
- Правится маппер или контракт этой сущности.

## Модель — неймспейс в `util` домена

Файл `libs/<семья>/<домен>/util/src/lib/models/<сущность>.model.ts`:

```typescript
export namespace IPromoCode {
    export namespace Short {
        export type Api = PromoCodeListItem;

        export interface State {
            readonly id: string;
            readonly code: string;
        }
    }

    export type Api = PromoCodeInfo;

    export interface State extends Short.State {
        readonly usageCount: number;
        /** Пусто = код действует на любой объект владельца */
        readonly propertyId: string;
        /** 0 = без предела */
        readonly usageLimit: number;
    }

    /** Что уходит на сервер при сохранении: id пуст — код новый */
    export interface Draft {
        readonly id: string;
        readonly code: string;
    }
}

export enum EPromoDiscountKind {
    Percent = 'percent',
    Amount = 'amount',
}
```

Перечисления домена лежат в том же файле, но **вне** неймспейса. Глубже двух уровней
вложенности не заводить: `IPromoCode.Short.State` читается, третий уровень уже нет.

Псевдонимы выборки объявляются там же:

```typescript
export type Query = IList.Query.State<EPromoCodeSortProperty, EPromoCodeFilterProperty>;
export type ListResult = IList.Result.State<IPromoCode.State, EPromoCodeSortProperty, EPromoCodeFilterProperty>;
```

## Маппер — в `api` домена, свой на каждый уровень

Файл `libs/<семья>/<домен>/api/src/lib/mappers/<сущность>-model.mapper.ts`:

```typescript
export class PromoCodeModelMapper extends BaseMapper<IPromoCode.State> {
    public override mapFrom(raw: IPromoCode.Api): IPromoCode.State {
        return {
            id: this.typeCast.getAsString(raw?.id),
            code: this.typeCast.getAsString(raw?.code),
            usageCount: this.typeCast.getAsNumber(raw?.usageCount),
            usageLimit: this.typeCast.getAsNumber(raw?.usageLimit),
        };
    }
}
```

Маппер без состояния и без DI:

```typescript
readonly #mapper: PromoCodeModelMapper = new PromoCodeModelMapper();
```

На каждый уровень — свой класс: `PromoCodeShortModelMapper` и `PromoCodeModelMapper`.

## Строковое поле с конечным набором сверяется явно

`getAsType` умолчания не принимает: значение вне набора он пишет в консоль и возвращает
строкой `'unknown'`.

```typescript
kind: promoDiscountKindOf(raw?.kind) ?? EPromoDiscountKind.Percent,
```

## После правки контракта

```bash
cd libs/common/proto && npx buf lint
npm run proto:generate
```

Ни `buf lint`, ни `buf breaking` не входят в `check:all` и в CI — гоняются руками.
Сгенерированные типы лежат в репозитории, и без перегенерации расхождение вылезет сборкой
чужого приложения.

Снятое поле помечается `reserved` с его номером и именем.

## Частые промахи

- `Api` переписан руками вместо псевдонима — разойдётся с контрактом молча.
- `??` вместо `typeCast` — контракт отдаёт значения по умолчанию, и проверка на `undefined`
  не ловит ничего.
- `as Type` в маппере — запрещено правилом `typescript-conventions`.
- `null` или `undefined` в `State` — пустое выражается пустой строкой или нулём, а смысл нуля
  объясняется комментарием рядом с полем.
- `readonly`-массив отдан в запрос: init-тип сообщения требует изменяемый, модель отдаётся
  копией.
- Общий тип на админку и сайт — у гостя своя короткая форма записи.
