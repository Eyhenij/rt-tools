---
name: api-layer-pair
kind: pattern
rule: api-layer
description: Паттерн правила api-layer. Брать при заведении или правке слоя api фронтового домена — готовые фасад и сервис, вход выборки, конвертер страницы, типы порядка и отбора в неймспейсе сущности. Не брать для модели и её маппера — это паттерн entity-models-new.
---

# Фасад и сервис домена

Паттерн правила `api-layer`. Что при этом должно быть верно — закон
`docs/constitution/frontend-application.md`.

## Когда брать

- Заводится слой `api` нового домена.
- Список переводится на общую выборку.
- Появляется новая процедура, за которой ходит экран.

## Фасад

Принимает запрос контракта, отдаёт ответ контракта, ожидание заворачивает в поток. Ни выборки,
ни перевода моделей в нём нет:

```typescript
@Injectable({ providedIn: 'root' })
export class PromoCodeApiFacade implements IListApiFacade<
    MessageInitShape<typeof ListPromoCodesRequestSchema>,
    ListPromoCodesResponse,
    GetPromoCodeResponse
> {
    readonly #client: Client<typeof PricingService> = injectConnectClient(PricingService);

    public getList(request: MessageInitShape<typeof ListPromoCodesRequestSchema>): Observable<ListPromoCodesResponse> {
        return from(this.#client.listPromoCodes(request));
    }
}
```

Метод, которого у домена нет, не объявляется: список читают все, правят не все.

## Сервис

Принимает доменные модели, отдаёт их же. Тип контракта до стора и шаблона не доходит:

```typescript
export class PromoCodeApiService implements IListApiService<
    IPromoCode.State,
    EPromoCodeSortProperty,
    EPromoCodeFilterProperty,
    IPromoCode.Draft
> {
    public getList(query: IPromoCode.Query): Observable<IPromoCode.ListResult> {
        return this.#facade
            .getList({ query: this.#queryMapper.mapTo(query) })
            .pipe(
                map((response: ListPromoCodesResponse): IPromoCode.ListResult =>
                    convertPaginationApiModelToStateModel((item: PromoCodeInfo): IPromoCode.State => this.#mapper.mapFrom(item), response)
                )
            );
    }
}
```

`getList` принимает выборку и больше ничего: объект, к которому привязан список, тип фида,
состояние подписки — это условия отбора, и лежат они в `filterModel`.

## Типы выборки в неймспейсе сущности

```typescript
export type Query = IList.Query.State<EPromoCodeSortProperty, EPromoCodeFilterProperty>;
export type ListResult = IList.Result.State<IPromoCode.State, EPromoCodeSortProperty, EPromoCodeFilterProperty>;
```

Перечисления `EPromoCodeSortProperty` и `EPromoCodeFilterProperty` объявляются в модели рядом с
сущностью и повторяют набор имён, по которым сортирует и отбирает сервер этого домена.

## Частые промахи

- Промежуточный объект между ответом и моделью: ответ ложится в конвертер целиком.
- Выборка из своего запроса вместо применённой из ответа: умолчание сервера и отброшенное им
  условие экран иначе не увидит.
- Второй вход рядом с выборкой (`propertyId`, `feedType`): отбор, живущий отдельно, не виден ни
  стору, ни адресу.
- Голая `string` в поле порядка: имя, по которому сервер не сортирует, компилируется и падает
  запросом.
- Один класс на две сущности: подмена источника одной потянет за собой правку другой.
- Промисный сервис в новом сторе: основа списочного стора работает потоками.
- Своя копия общих мапперов страницы, порядка и отбора — её ловит `npm run check:dupes`.
