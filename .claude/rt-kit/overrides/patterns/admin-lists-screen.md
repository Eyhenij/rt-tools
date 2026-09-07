## The slots of the shared page and the host token

A section of this tree. Between the screen and the kit stands the shared page view
`admin-list-page`: it declares the toolbar, the heading, the place for the table, the refusal with
a retry and the page switcher — not the screen. What is left for the section is to put its own
into the page slots and to name itself the host.

The whole screen is three things in the decorator and three in the template:

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
    protected readonly qaPrefix: string = 'proposals';
    /* the store, the columns, the order fields and the table sign — as they were */
}
```

The class is passed to the provider by a call, not by value: providers are parsed together with
the decorator, when the class name is not bound yet, and one passed by value would fall with a
reference to something undeclared.

```html
<admin-list-page [hint]="hint" [qaPrefix]="qaPrefix" [title]="title">
    <ng-template adminListToolbarLeft>
        <admin-tree-filter [choices]="choices()" [tree]="query().tree" (treeChange)="changeTree($event)" />
    </ng-template>

    <rt-table #rowsTable="rtTable" clickable [attr.qa-dataid]="qaTable()" [dataSource]="rows()"><!-- … --></rt-table>
</admin-list-page>
```

There are three slots: `adminListToolbarLeft` — what changes the selection; `adminListToolbarRight`
— the section buttons; `adminListAboveTable` — what concerns the whole list at once. An unoccupied
slot does not appear on the screen at all and takes no height: a measurement on three sections
gives a gap between the toolbar and the table of exactly one page column step.

**The table is declared as a kit element, not as an attribute on one's own markup.** The kit has
one selector for two forms, and both build: `<table rt-table>` gives table semantics by the tag
itself, but the skeletons, the reading overlay and the narrow-screen cards it draws as nodes that
are never children of `<table>` — on that form they are not visible at all. The element form gets
its semantics by a role the kit sets itself: `role="table"` on the host, the row and cell roles
from CDK.

**The section anchors are assembled from its prefix, not written as a string at each element.**
The section names the prefix once by the field `qaPrefix`, from it the shared base gives
`qaTable()` and `qaRow()`, and the cells are assembled in place —
`[attr.qa-dataid]="qaPrefix + '-cell-tree'"`. Strings written out one by one drift from the prefix
silently: a spec that opened a neighbouring section finds its own anchor by them and passes green.

**An empty list shows an emptiness view, not a phrase in place of the rows.** The view is given by
the kit and only once the read is over: an icon, a heading and a second line about where the
records come from. In two lines, not one through a colon: the kit draws them as different nodes
and in different type.

```typescript
/* in the shared base the second line is one for the cargo sections, and the filter changes it */
protected readonly emptyDescription: Signal<string> = computed(() =>
    adminLabel(this.query().tree === '' ? 'listEmptyFrom' : 'listEmptyByFilterFrom'),
);

/* a section it does not suit overrides it with its own */
protected override readonly emptyDescription: Signal<string> = computed(() => adminLabel('listEmptyInvitesFrom'));
```

The view heading is the input `[emptyMessage]`, the second line is `[emptyDescription]`, the icon
is `[emptyIcon]`. The skeletons of an ongoing read and the refusal toast stay as they were: three
states — empty, reading, refused — are distinguishable on the screen, and one is not substituted
for another.

The page knows the prefix by the same word: from it the page assembles `<prefix>-hint`,
`<prefix>-columns`, `<prefix>-refresh`, `<prefix>-fault` and `<prefix>-retry`. The end-to-end suite
takes them by the helper `pageQa`, not by a string in place.

### Frequent misses of this layer

- Refresh or the column settings put by a section into the right slot — they are drawn by the
  page, and second buttons like them will stand next to the first.
- An input or an event added to the page for the sake of a new action — the action is asked of the
  host, and it is declared once in the host model.
- A host answer written in the screen itself — everything is answered by the shared list screen
  base; the screen only points at itself by a provider.
- An anchor `list-*` on the shared page — it is the same on every section, and a spec that opened
  the wrong section finds that very one.
- The phrase «no records» written in the template under `@if` by the list length — a screen
  assembled that way shows it during an ongoing read and after a refusal too: emptiness is told
  from them by the kit, not by an array length.
