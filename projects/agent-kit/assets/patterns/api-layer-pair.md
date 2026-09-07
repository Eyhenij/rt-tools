---
name: api-layer-pair
kind: pattern
rule: api-layer
description: Pattern of rule api-layer. Load when creating or editing the api layer of a frontend domain — ready-made facade and service, the query input, the page converter, order and filter types in the entity namespace. Not for the model and its mapper — that is pattern entity-models-new.
---

# The facade and the service of a domain

Pattern of the rule `api-layer`. What must be true — the law
`docs/constitution/frontend-application.md`.

## When to use

- The `api` layer of a new domain is created.
- A list is moved onto the shared query.
- A new procedure appears that a screen calls.

## The facade

Takes a contract request, returns a contract response, wraps the wait into a stream. Neither the
query nor the model translation is in it:

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

A method the domain does not have is not declared: everyone reads the list, not everyone edits.

## The service

Takes domain models, returns the same. A type from the contract does not reach the store and
the template:

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

`getList` takes the query and nothing else: the object the list is bound to, the feed type, the
subscription state — those are filter conditions, and they lie in `filterModel`.

## Query types in the entity namespace

```typescript
export type Query = IList.Query.State<EPromoCodeSortProperty, EPromoCodeFilterProperty>;
export type ListResult = IList.Result.State<IPromoCode.State, EPromoCodeSortProperty, EPromoCodeFilterProperty>;
```

The enums `EPromoCodeSortProperty` and `EPromoCodeFilterProperty` are declared in the model next
to the entity and repeat the set of names by which the server of this domain sorts and filters.

## Common misses

- An intermediate object between the response and the model: the response goes into the
  converter whole.
- The query from its own request instead of the applied one from the response: otherwise the
  screen will not see the server default and a condition the server dropped.
- A second input next to the query (`propertyId`, `feedType`): a filter living apart is seen by
  neither the store nor the address.
- A bare `string` in the order field: a name the server does not sort by compiles and fails as a
  request.
- One class for two entities: replacing the source of one drags an edit of the other along.
- A promise service in a new store: the base of the list store works with streams.
- An own copy of the shared page, order and filter mappers — caught by `npm run check:dupes`.
