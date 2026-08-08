---
name: entity-store
kind: pattern
rule: entity-conventions
description: Паттерн правила entity-conventions. Брать при заведении или правке стора админки — готовый наследник общей основы списочного стора, обвязка mutate, имена методов от действия, действие со своей занятостью. Не брать для панели — это паттерн entity-aside.
---

# Стор сущности

Паттерн правила `entity-conventions`. Что при этом должно быть верно — закон
`docs/constitution/entity-editing.md`.

## Когда брать

- Заводится `<сущность>.store.ts`.
- Правится метод загрузки или записи существующего стора.

## Наследник объявляет своё в четырёх строках

```typescript
@Injectable()
export class PromoCodesStore extends BaseListStoreService<
    IPromoCodesState,
    string,
    IPromoCode.State,
    EPromoCodeSortProperty,
    EPromoCodeFilterProperty,
    IPromoCode.Draft
> {
    protected override readonly apiService: PromoCodeApiService = inject(PromoCodeApiService);
    protected override readonly listErrorKey: string = 'promoCodesLoadFailed';

    constructor() {
        super({ ...INITIAL_STATE.LIST }, { name: 'PromoCodesStore' });

        this.setConfig({ usePagination: true, useSorting: true, useFiltering: true, useSearch: true });
    }

    protected override mutationErrorKeyOf(error: unknown): string {
        return promoRejectionKey(error);
    }
}
```

Конфиг решает, что уходит в выборку. Выключено всё — выборки нет вовсе, и сервер отдаёт список
целиком. Из основы работают загрузка и перезапрос, смена страницы, порядка, условий отбора и
строки поиска, догрузка следующей страницы, правка одной записи в списке и сброс выборки.

Файл называется `<сущность>.store.ts`: имя `<сущность>-store.service.ts` выводит его и из
правила линтера, и из гейта скилов.

## Метод правки отдаёт поток

```typescript
public save(draft: IPromoCode.Draft): Observable<IPromoCode.State | null> {
    return this.mutate(this.apiService.save(draft));
}
```

`mutate` держит занятость, гашение прежней ошибки, перечитывание списка после успеха и ключ
отказа. Мутация завершается **перечитанным списком**, а не отправленным запросом: панель
закрывается по значению потока, и список, перечитанный после закрытия, показал бы прежнее
значение.

## Имена — от действия, а не от домена

| ✗                                    | ✓          |
| ------------------------------------ | ---------- |
| `createBooking()`, `updateBooking()` | `save()`   |
| `deleteBooking()`, `removeFeed()`    | `remove()` |
| `loadBookings()`, `fetchFeeds()`     | `load()`   |

Имя домена уже в имени стора и в его алиасе.

## Действие со своей занятостью

Идёт мимо `mutate`: опрос подписки на календарь держит `pollingId`, потому что панель на минуту
опроса не гасится, а ключ отказа кладёт `setErrorKey`.

## Частые промахи

- Булев ответ у метода правки: он теряет и записанную запись, и причину отказа — панель узнаёт
  только «не вышло».
- Своя обвязка занятости и ошибки вокруг вызова сервиса: всё это в `mutate`.
- Свои сигналы записей, занятости и отказа: они в общей основе.
- Подписка на сигнал отказа загрузки: сигнал делят список и панель, и один отказ показался бы
  дважды. Отказ загрузки идёт отдельным потоком.
- Второе поле сортировки: порядок в выборке один — его не принимают ни таблица, ни контракт,
  ни разбор на сервере.
- Хвост с `EMPTY`, приклеенный к мутации: он гасится `defaultIfEmpty`, иначе отказ приклеенного
  потока превращает удачную запись в вечный спиннер.
