## Слоты общей страницы и токен хоста

Раздел этого дерева. Между экраном и китом здесь стоит общий вид страницы `admin-list-page`:
тулбар, заголовок, место под таблицу, отказ с повтором и переключатель страниц объявляет он, а
не экран. Разделу остаётся положить в его слоты своё и назвать себя хостом.

Экран целиком — три вещи в декораторе и три в шаблоне:

```typescript
@Component({
    selector: 'admin-proposals-list',
    imports: [AdminListPageComponent, AdminListToolbarLeftDirective, AdminTreeFilterComponent /* … */],
    providers: [provideAdminListHost((): typeof AdminProposalsListComponent => AdminProposalsListComponent)],
    host: { class: BEM_BLOCK },
})
export class AdminProposalsListComponent extends AdminListScreenBase<IProposal.Short.State, IProposal.Short.Api> {
    protected readonly title: string = adminLabel('sectionProposals');
    protected readonly hint: string = adminLabel('hintProposals');
    /* стор, столбцы, поля порядка и признак таблицы — как и было */
}
```

Класс передаётся в провайдер вызовом, а не значением: провайдеры разбираются вместе с
декоратором, когда имя класса ещё не связано, и переданное значением упало бы обращением к
необъявленному.

```html
<admin-list-page qaPrefix="proposals" [hint]="hint" [title]="title">
    <ng-template adminListToolbarLeft>
        <admin-tree-filter [choices]="choices()" [tree]="query().tree" (treeChange)="changeTree($event)" />
    </ng-template>

    <table #rowsTable="rtTable" rt-table clickable qa-dataid="proposals-table" [dataSource]="rows()"><!-- … --></table>
</admin-list-page>
```

Слотов три: `adminListToolbarLeft` — то, что меняет выборку; `adminListToolbarRight` — кнопки
раздела; `adminListAboveTable` — то, что относится ко всему списку сразу. Незанятый слот на
экране не появляется вовсе, и высоты он не занимает: замер на трёх разделах даёт промежуток
между тулбаром и таблицей ровно в шаг колонки страницы.

`qaPrefix` — то же слово, что у таблицы раздела: из него страница собирает `<префикс>-hint`,
`<префикс>-columns`, `<префикс>-refresh`, `<префикс>-fault` и `<префикс>-retry`. Сквозной набор
берёт их помощником `pageQa`, а не строкой на месте.

### Частые промахи этого слоя

- Обновление или настройка столбцов, положенные разделом в правый слот, — их рисует страница, и
  вторые такие же кнопки встанут рядом с первыми.
- Вход или событие, добавленные странице ради нового действия, — действие спрашивается у хоста,
  и объявляется оно один раз в модели хоста.
- Ответ хоста, написанный в самом экране, — на всё отвечает общая основа списочного экрана;
  экран только указывает на себя провайдером.
- Якорь `list-*` на общей странице — он одинаков у трёх разделов, и спека, открывшая не тот
  раздел, находит его же.
