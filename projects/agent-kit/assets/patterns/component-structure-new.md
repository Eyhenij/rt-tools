---
name: component-structure-new
kind: pattern
rule: component-structure
description: Паттерн правила component-structure. Брать при заведении или правке файла компонента — порядок свойств декоратора, группировка импортов, раскладка полей класса, договорённости шаблона и якорь для спек. Не брать для состояния и потоков — это паттерн angular-patterns-state.
---

# Файл компонента

Паттерн правила `component-structure`. Что при этом должно быть верно — закон
`{{lawsDir}}/frontend-application.md`.

## Когда брать

- Заводится новый компонент.
- Правится декоратор, список импортов или шаблон существующего.

## Декоратор: порядок свойств

```typescript
@Component({
    selector: '<префикс>-component-name', // 1. селектор
    templateUrl: './component-name.component.html', // 2. шаблон
    styleUrl: './component-name.component.scss', // 3. стиль, в единственном числе
    changeDetection: ChangeDetectionStrategy.OnPush, // 4. стратегия перерисовки
    imports: [
        // 5. импорты, группами
        // каркас
        FormsModule,

        // директивы разметки
        BlockDirective,
        ElemDirective,

        // компоненты
        SomeChildComponent,
    ],
    providers: [], // 6. провайдеры
    host: { class: '<префикс>-component-name' }, // 7. привязки хоста
})
export class ComponentNameComponent {
    readonly #someService: SomeService = inject(SomeService);

    public readonly data: InputSignal<Item[]> = input.required<Item[]>();
    public readonly save: OutputEmitterRef<void> = output<void>();

    protected readonly items: WritableSignal<Item[]> = signal<Item[]>([]);
    protected readonly itemCount: Signal<number> = computed((): number => this.items().length);
}
```

Группирующие комментарии в импортах обязательны: без них список растёт вперемешку, и первое,
что в нём теряется, — свои компоненты среди чужих.

## Шаблон

- Самозакрывающиеся теги у компонентов без содержимого.
- Лишних обёрток нет — корнем работает хост, класс блока приходит его привязкой.
- Сложный шаблон объявляет блок в корне отдельной директивой.
- Один компонент в обеих ветках условия — это условная привязка:

```html
<!-- ✗ -->
@if (isRangeMode()) {
<calendar [rangeMode]="true" />
} @else {
<calendar [rangeMode]="false" />
}

<!-- ✓ -->
<calendar [rangeMode]="isRangeMode()" />
```

- Прокрутка по документу — средствами маршрутизатора, а не ссылкой на фрагмент: при объявленном
  базовом адресе браузер разрешает фрагмент относительно него и уходит в полную навигацию.

## Якорь для спек — на каждый интерактивный элемент

```html
<button qa-dataid="calendar-retry-prices" type="button" (click)="retryPrices.emit()">Повторить</button>
<div rtElem="grid" qa-dataid="admin-calendar-grid"></div>
```

- Значение — через дефис, по смыслу элемента, без имени компонента-обёртки.
- Уникальность — в пределах экрана; повторяющиеся элементы списка носят один якорь и
  различаются атрибутами данных.
- Декоративный элемент помечается признаком пропуска на самом теге.

## Частые промахи

- **Чужой префикс селектора** — компонент перестаёт узнаваться как свой.
- **Множественная форма свойства стилей вместо единственной** — стиль молча не подключается.
- **Вызов метода в привязке** — отбивается линтером; замена — вычисляемое значение, а там, где
  оно зависит от контекста шаблона, — чистый преобразователь.
- **Обёртка, которая существует только чтобы быть контейнером раскладки вокруг всех детей:** её
  раскладка уезжает на хост.
- **Глубокий относительный импорт между либами** вместо алиаса.
- **Своя разметка вместо готового компонента** — правило `reuse-first`.
