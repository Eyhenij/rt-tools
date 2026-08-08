---
name: angular-patterns-state
kind: pattern
rule: angular-patterns
description: Паттерн правила angular-patterns. Брать при объявлении состояния и потоков в классе Angular — готовые сигналы, производные значения, состояние сервиса, долгоживущая подписка с источником действия. Не брать для раскладки файла компонента — это правило component-structure.
---

# Состояние и потоки

Паттерн правила `angular-patterns`. Что при этом должно быть верно — закон
`docs/constitution/frontend-application.md`.

## Когда брать

- Объявляется состояние компонента или сервиса.
- Появляется поток, на который надо подписаться.
- Значение считается из другого значения.

## Сигнальный API входов и выходов

```typescript
public readonly data: InputSignal<Item[]> = input.required<Item[]>();
public readonly isMobile: InputSignal<boolean | undefined> = input<boolean>();
public readonly save: OutputEmitterRef<void> = output<void>();

protected readonly myButton: Signal<ElementRef | undefined> = viewChild<ElementRef>('button');
```

Декораторов `@Input()`, `@Output()`, `@ViewChild()`, `@ContentChild()` и их множественных пар
в дереве нет.

## Производное значение — `computed`, а не эффект

```typescript
protected readonly items: WritableSignal<Item[]> = signal<Item[]>([]);
protected readonly itemCount: Signal<number> = computed((): number => this.items().length);
protected readonly hasItems: Signal<boolean> = computed((): boolean => this.itemCount() > 0);
```

```typescript
✗ effect((): void => { this.count.set(this.items().length); });
✓ protected readonly count: Signal<number> = computed((): number => this.items().length);
```

Геттера в компоненте не заводить: он пересчитывается на каждой перерисовке, и цена его не
видна ни в одном месте кода.

## Состояние сервиса

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

Метод действия толкает значение в источник, подписка живёт в конструкторе:

```typescript
readonly #loadSource: Subject<void> = new Subject<void>();
readonly #destroyRef: DestroyRef = inject(DestroyRef);

constructor() {
    this.#loadSource
        .pipe(
            switchMap((): Observable<IPromoCode.ListResult> => this.#api.getList(this.#query())),
            takeUntilDestroyed(this.#destroyRef)
        )
        .subscribe();
}

protected reload(): void {
    this.#loadSource.next();
}
```

Оператор выбирается по тому, что делать с предыдущим запросом: список берёт последний ответ
(`switchMap`), кнопка не плодит дублей (`exhaustMap`), соседние строки идут независимо
(`mergeMap`).

## Частые промахи

- `.subscribe()` внутри метода: правило линтера отбивает, а вместе с ним отбивается и гонка
  ответов на быстрых нажатиях.
- Подписка без `takeUntilDestroyed`: она переживает владельца и держит уничтоженный экран в
  памяти.
- Поле-поток без суффикса `Source`: поток и значение в коде становятся неотличимы.
- `inject()` вместо параметров конструктора — везде, включая базовые классы.
- `untracked()` там, где эффекту не нужна зависимость от сигнала: без него эффект просыпается
  на каждое чужое изменение.
