---
name: angular-patterns-state
kind: pattern
rule: angular-patterns
description: Паттерн правила angular-patterns. Брать при объявлении состояния и потоков в классе фронтового каркаса — реактивные входы и выходы, производные значения, состояние службы, долгоживущая подписка с источником действия. Не брать для раскладки файла компонента — это паттерн component-structure-new.
---

# Состояние и потоки

Паттерн правила `angular-patterns`. Что при этом должно быть верно — закон
`{{lawsDir}}/frontend-application.md`.

## Когда брать

- Объявляется состояние компонента или службы.
- Появляется поток, на который надо подписаться.
- Значение считается из другого значения.

## Реактивные входы и выходы

```typescript
public readonly data: InputSignal<Item[]> = input.required<Item[]>();
public readonly isNarrow: InputSignal<boolean | undefined> = input<boolean>();
public readonly save: OutputEmitterRef<void> = output<void>();

protected readonly myButton: Signal<ElementRef | undefined> = viewChild<ElementRef>('button');
```

Декораторной формы входов, выходов и запросов к разметке в дереве нет: у неё нет типа, который
видно в месте использования, и нет реактивности, на которую можно подписаться.

## Производное значение — вычисляемое, а не эффект

```typescript
✗ effect((): void => { this.count.set(this.items().length); });
✓ protected readonly count: Signal<number> = computed((): number => this.items().length);
```

Эффект, кладущий значение в реактивное поле, — это ручной пересчёт, и он рано или поздно
отстаёт от источника. Геттера в компоненте не заводить: он пересчитывается на каждой
перерисовке, и цена его не видна ни в одном месте кода.

## Состояние службы

Наружу — только чтение:

```typescript
@Injectable({ providedIn: 'root' })
export class DomainStateService {
    readonly #items: WritableSignal<Item[]> = signal<Item[]>([]);

    public readonly items: Signal<Item[]> = this.#items.asReadonly();
    public readonly itemCount: Signal<number> = computed((): number => this.#items().length);

    public addItem(item: Item): void {
        this.#items.update((items: Item[]): Item[] => [...items, item]);
    }
}
```

## Подписка объявляется один раз

Метод действия толкает значение в источник, подписка живёт при создании владельца:

```typescript
readonly #loadSource: Subject<void> = new Subject<void>();
readonly #destroyRef: DestroyRef = inject(DestroyRef);

constructor() {
    this.#loadSource
        .pipe(
            switchMap((): Observable<IResult> => this.#api.getList(this.#query())),
            takeUntilDestroyed(this.#destroyRef)
        )
        .subscribe();
}

protected reload(): void {
    this.#loadSource.next();
}
```

Оператор выбирается по тому, что делать с предыдущим запросом: список берёт последний ответ,
кнопка не плодит дублей, независимые строки идут параллельно.

## Частые промахи

- **Подписка внутри метода:** правило линтера отбивает, а вместе с ним отбивается и гонка
  ответов на быстрых нажатиях.
- **Подписка без гашения:** она переживает владельца и держит уничтоженный экран в памяти.
- **Поле-поток без суффикса источника:** поток и значение в коде становятся неотличимы.
- **Параметры конструктора вместо функции внедрения** — везде, включая базовые классы.
- **Эффект без снятия слежения там, где зависимость не нужна:** он просыпается на каждое чужое
  изменение.
