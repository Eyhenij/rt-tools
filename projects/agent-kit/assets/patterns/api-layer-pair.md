---
name: api-layer-pair
kind: pattern
rule: api-layer
description: Паттерн правила api-layer. Брать при заведении или правке слоя обращения к серверу во фронтовом домене — готовые фасад и служба, единственный вход выборки, общий конвертер страницы, типы порядка и отбора при сущности.
---

# Фасад и служба домена

Паттерн правила `api-layer`. Что при этом должно быть верно — закон
`{{lawsDir}}/frontend-application.md`.

## Когда брать

- Заводится слой обращения к серверу у нового домена.
- Список переводится на общую выборку.
- Появляется новый обработчик, за которым ходит экран.

## Фасад

Принимает запрос контракта, отдаёт ответ контракта, ожидание заворачивает в поток. Ни выборки,
ни перевода моделей в нём нет:

```typescript
@Injectable({ providedIn: 'root' })
export class EntityApiFacade implements IListApiFacade<TListRequest, TListResponse, TItemResponse> {
    readonly #client: Client<typeof DomainService> = injectClient(DomainService);

    public getList(request: TListRequest): Observable<TListResponse> {
        return from(this.#client.listItems(request));
    }
}
```

Метод, которого у домена нет, не объявляется: список читают все, правят не все.

## Служба

Принимает доменные модели, отдаёт их же. Тип контракта до стора и шаблона не доходит:

```typescript
export class EntityApiService implements IListApiService<IEntity.State, ESortProperty, EFilterProperty, IEntity.Draft> {
    public getList(query: IEntity.Query): Observable<IEntity.ListResult> {
        return this.#facade
            .getList({ query: this.#queryMapper.mapTo(query) })
            .pipe(
                map((response: TListResponse): IEntity.ListResult =>
                    convertPaginationApiModelToStateModel((item: TItem): IEntity.State => this.#mapper.mapFrom(item), response)
                )
            );
    }
}
```

Выборка — единственный вход: объект, к которому привязан список, род ленты, состояние подписки
— это условия отбора, и лежат они в её условиях.

## Типы выборки при сущности

```typescript
export type Query = IList.Query.State<ESortProperty, EFilterProperty>;
export type ListResult = IList.Result.State<IEntity.State, ESortProperty, EFilterProperty>;
```

Перечисления порядка и отбора объявляются рядом с сущностью и повторяют набор имён, по которым
сортирует и отбирает сервер именно этого домена.

## Частые промахи

- **Промежуточный объект между ответом и моделью:** ответ ложится в конвертер целиком.
- **Выборка из своего запроса вместо применённой из ответа:** умолчание сервера и отброшенное
  им условие экран иначе не увидит.
- **Второй вход рядом с выборкой:** отбор, живущий отдельно, не виден ни стору, ни адресу.
- **Голая строка в поле порядка:** имя, по которому сервер не сортирует, компилируется и падает
  запросом.
- **Один класс на две сущности:** подмена источника одной потянет за собой правку другой.
- **Служба на обещаниях в новом сторе:** основа списочного стора работает потоками.
- **Своя копия общих переводчиков страницы, порядка и отбора** — её ловит проверка повторов.
