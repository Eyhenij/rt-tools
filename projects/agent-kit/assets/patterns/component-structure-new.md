---
name: component-structure-new
kind: pattern
rule: component-structure
description: Паттерн правила component-structure. Брать при заведении или правке *.component.ts — готовый декоратор с порядком свойств, группировка импортов, раскладка полей класса, договорённости шаблона и qa-dataid. Не брать для состояния и потоков — это паттерн angular-patterns-state.
---

# Файл компонента

Паттерн правила `component-structure`. Что при этом должно быть верно — закон
`docs/constitution/frontend-application.md`.

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
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        SomeChildComponent,
    ],
    providers: [], // 6. провайдеры
    host: { class: '<префикс>-component-name' }, // 7. привязки хоста
})
export class ComponentNameComponent {
    readonly #someService: SomeService = inject(SomeService);

    public readonly data: InputSignal<Item[]> = input.required<Item[]>();
    public readonly save: OutputEmitterRef<void> = output<void>();

    protected readonly myButton: Signal<ElementRef | undefined> = viewChild<ElementRef>('button');
    protected readonly items: WritableSignal<Item[]> = signal<Item[]>([]);
    protected readonly itemCount: Signal<number> = computed((): number => this.items().length);
}
```

Группирующие комментарии в `imports` обязательны: `// angular`, `// rt-tools`,
`// components`, `// directives`, `// pipes`.

## Шаблон

- Самозакрывающиеся теги у компонентов без содержимого: `<<префикс>-gallery />`.
- Лишних обёрток нет — корнем работает `:host`, класс блока приходит с `host: { class: … }`.
- Сложный шаблон объявляет блок `<ng-container rtBlock="component-name">` в корне.
- Один компонент в обеих ветках `@if` — это условная привязка:

```html
<!-- ✗ -->
@if (isRangeMode()) { <<префикс>-calendar [rangeMode]="true" /> } @else { <<префикс>-calendar [rangeMode]="false" /> }

<!-- ✓ -->
<<префикс>-calendar [rangeMode]="isRangeMode()" />
```

- Прокрутка по документу — через роутер, а не `href="#id"`:

```html
<a fragment="booking" [routerLink]="[]">…</a>
```

## `qa-dataid` — на каждый интерактивный элемент

```html
<button vmButton qa-dataid="calendar-retry-prices" type="button" (click)="retryPrices.emit()">Повторить</button>
<div rtElem="grid" qa-dataid="admin-calendar-grid"></div>
```

- Значение — kebab-case по смыслу элемента, без имени компонента-обёртки: `calendar-day`,
  `booking-submit`.
- Уникальность — в пределах экрана; повторяющиеся элементы списка носят один якорь и
  различаются через `data-*` (`[attr.data-iso]`, `[attr.data-state]`).
- Декоративный элемент помечается `qa-skip` на самом теге.

## Частые промахи

- `selector: 'app-component'` вместо `<префикс>-component`.
- `styleUrls: ['./component.scss']` вместо `styleUrl` — множественное число здесь не то.
- Вызов метода в биндинге: `{{ getTotal() }}` отбивается линтером. Замена — `computed()`, а
  там, где значение приходит из контекста шаблона, — чистый пайп.
- Обёртка, которая существует только чтобы быть flex- или grid-контейнером вокруг всех детей:
  её раскладка уезжает на `:host`.
- Глубокий относительный импорт между либами вместо `@<область>/<семья>/<домен>/<слой>`.
- Своя разметка вместо готового компонента кита — правило `reuse-first`.
