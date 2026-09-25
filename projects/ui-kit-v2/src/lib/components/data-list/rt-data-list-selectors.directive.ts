import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    Injector,
    input,
    InputSignalWithTransform,
    OnInit,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap, take } from 'rxjs/operators';

import { transformArrayInput, TNullable } from '@rt-tools/utils';

import { RtDataTableComponent } from '../data-table/rt-data-table.component';
import {
    dataTableAllOnPage,
    dataTableAnyOnPage,
    dataTableKeysOf,
    dataTablePresetEntities,
    dataTableWithEntity,
    dataTableWithoutPageEntities,
    dataTableWithPageEntities,
} from '../data-table/rt-data-table-selection.logic';
import { RtDataListComponent } from './rt-data-list.component';
import { RtDataListToolbarComponent } from './toolbar/rt-data-list-toolbar.component';
import {
    dataListExcludedAfterEntity,
    dataListExcludedAfterPageMarked,
    dataListExcludedAfterPageUnmarked,
    dataListSelectedAfterPage,
} from './rt-data-list-selection.logic';

/**
 * Выбор записей списка `rt-data-list` — выбор первого кита вместе с «отметить все».
 *
 * «Отметить все» в разведённом виде отмечает и те страницы, которые ещё не приходили: пришедшая
 * страница отмечается сама, а снятая запись уходит в исключения и приходит неотмеченной каждый
 * раз. Приложение читает и отмеченные записи, и исключения — действие над всеми записями оно
 * отправляет как «все, кроме этих».
 */
@Directive({
    selector: 'rt-data-list[rtDataListSelectors]',
})
export class RtDataListSelectorsDirective<
    ENTITY_TYPE extends Record<string, unknown>,
    SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
    KEY extends Extract<keyof ENTITY_TYPE, string>,
> implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #injector: Injector = inject(Injector);
    readonly #list: RtDataListComponent<ENTITY_TYPE, SORT_PROPERTY, KEY> =
        inject<RtDataListComponent<ENTITY_TYPE, SORT_PROPERTY, KEY>>(RtDataListComponent);

    readonly #selectedEntities: WritableSignal<ENTITY_TYPE[]> = signal([]);
    readonly #excludedEntities: WritableSignal<ENTITY_TYPE[]> = signal([]);
    readonly #isAllEntitiesSelected: WritableSignal<boolean> = signal(false);
    readonly #isPageEntitiesSelected: WritableSignal<boolean> = signal(false);
    readonly #isPageEntitiesIndeterminate: WritableSignal<boolean> = signal(false);
    readonly #isAcrossPagesEnabled: WritableSignal<boolean> = signal(false);

    public readonly isMultiSelect: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    /** «Отметить все» отмечает и не пришедшие страницы; приложение может это выключить. */
    public readonly isMultiSelectExtendedMod: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    public readonly isSelectAllSelectorShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });

    public readonly isSelectorsColumnDisabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    public readonly selectedEntitiesKeys: InputSignalWithTransform<ENTITY_TYPE[KEY][], ENTITY_TYPE[KEY][] | null | undefined> = input<
        ENTITY_TYPE[KEY][],
        ENTITY_TYPE[KEY][] | null | undefined
    >([], { transform: transformArrayInput });

    public readonly selectedEntities: Signal<ENTITY_TYPE[]> = this.#selectedEntities.asReadonly();
    public readonly excludedEntities: Signal<ENTITY_TYPE[]> = this.#excludedEntities.asReadonly();

    public readonly selectedEntitiesIds: Signal<ENTITY_TYPE[KEY][]> = computed(() =>
        dataTableKeysOf(this.selectedEntities(), this.#keyExp())
    );

    public readonly excludedEntitiesIds: Signal<ENTITY_TYPE[KEY][]> = computed(() =>
        dataTableKeysOf(this.excludedEntities(), this.#keyExp())
    );

    public readonly isAllEntitiesSelected: Signal<boolean> = this.#isAllEntitiesSelected.asReadonly();
    public readonly isPageEntitiesSelected: Signal<boolean> = this.#isPageEntitiesSelected.asReadonly();
    public readonly isPageEntitiesIndeterminate: Signal<boolean> = this.#isPageEntitiesIndeterminate.asReadonly();

    /** Отмечены все записи, включая не пришедшие страницы. */
    public readonly isAcrossPagesEnabled: Signal<boolean> = this.#isAcrossPagesEnabled.asReadonly();

    /** Тот же признак под именем первого кита: приложение, читавшее его там, переезжает без правок. */
    public readonly isMultiSelectExtendedModEnabled: Signal<boolean> = this.isAcrossPagesEnabled;

    constructor() {
        /* Отметки ведёт директива, а рисуют их панель действий и таблица списка. */
        effect(() => {
            const table: TNullable<RtDataTableComponent<ENTITY_TYPE, SORT_PROPERTY, KEY>> = this.#list.tableRef();

            if (table) {
                table.isSelectorsColumnShown.set(true);
                table.isMultiSelect.set(this.isMultiSelect());
                table.isSelectorsColumnDisabled.set(this.isSelectorsColumnDisabled());
                table.selectedEntitiesIds.set(this.selectedEntitiesIds());
                table.isPageEntitiesSelected.set(this.isPageEntitiesSelected());
                table.isPageEntitiesIndeterminate.set(this.isPageEntitiesIndeterminate());
                table.onToggleEntity = (entity: ENTITY_TYPE, checked: boolean): void => this.toggleEntity(entity, checked);
                table.onTogglePageEntities = (checked: boolean): void => this.togglePageEntities(checked);
            }
        });

        effect(() => {
            const toolbar: TNullable<RtDataListToolbarComponent> = this.#list.toolbarRef();

            if (toolbar) {
                toolbar.isMultiSelect.set(this.isMultiSelect());
                toolbar.isSelectAllSelectorShown.set(this.isSelectAllSelectorShown());
                toolbar.isSelectAllSelectorDisabled.set(this.isSelectorsColumnDisabled());
                toolbar.isAllEntitiesSelected.set(this.isAllEntitiesSelected());
                toolbar.isAllEntitiesIndeterminate.set(!!this.selectedEntities().length);
                toolbar.selectedEntitiesCount.set(this.selectedEntities().length);
                toolbar.onToggleAllEntities = (checked: boolean): void => this.toggleAllEntities(checked);
            }
        });
    }

    public ngOnInit(): void {
        /* Пришла страница: под «отметить все» её строки отмечаются сами, кроме исключённых. */
        toObservable(this.#list.entities, { injector: this.#injector })
            .pipe(takeUntilDestroyed(this.#destroyRef))
            .subscribe((page: ENTITY_TYPE[]) => {
                if (this.isAcrossPagesEnabled()) {
                    this.#selectedEntities.update((selected: ENTITY_TYPE[]) =>
                        dataListSelectedAfterPage(selected, page, this.excludedEntities(), this.#keyExp())
                    );
                    this.#isAllEntitiesSelected.set(!this.excludedEntities().length);
                }

                this.setExistingEntitiesState();
            });

        /* Отметки, названные заранее, ставятся один раз: к первым непустым строкам. */
        toObservable(this.#list.entities, { injector: this.#injector })
            .pipe(
                filter((entities: ENTITY_TYPE[]) => !!entities.length),
                take(1),
                switchMap(() =>
                    toObservable(this.selectedEntitiesKeys, { injector: this.#injector }).pipe(
                        filter((keys: ENTITY_TYPE[KEY][]) => !!keys.length),
                        take(1)
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe(() => {
                this.#selectedEntities.set(dataTablePresetEntities(this.#list.entities(), this.selectedEntitiesKeys(), this.#keyExp()));
                this.setExistingEntitiesState();
            });
    }

    /** «Отметить все»: отмечает все пришедшие строки, а в разведённом виде — и будущие страницы. */
    public toggleAllEntities(checked: boolean): void {
        this.#isAllEntitiesSelected.set(checked);

        if (this.isMultiSelectExtendedMod()) {
            this.#isAcrossPagesEnabled.set(checked);
        }

        this.#selectedEntities.set(checked ? [...this.#list.entities()] : []);
        this.#isPageEntitiesSelected.set(checked);
        this.#isPageEntitiesIndeterminate.set(checked);
    }

    /** Отметить или снять все строки показанной страницы. */
    public togglePageEntities(checked: boolean): void {
        const page: ENTITY_TYPE[] = this.#list.entities();

        this.#isPageEntitiesSelected.set(checked);
        this.#selectedEntities.update((selected: ENTITY_TYPE[]) =>
            checked
                ? dataTableWithPageEntities(selected, page, this.#keyExp())
                : dataTableWithoutPageEntities(selected, page, this.#keyExp())
        );

        if (this.isAcrossPagesEnabled()) {
            this.#excludedEntities.update((excluded: ENTITY_TYPE[]) =>
                checked
                    ? dataListExcludedAfterPageMarked(excluded, page, this.#keyExp())
                    : dataListExcludedAfterPageUnmarked(excluded, page, this.#keyExp())
            );
        }

        this.#isAllEntitiesSelected.set(this.isAcrossPagesEnabled() && checked && !this.excludedEntities().length);
        this.#isPageEntitiesIndeterminate.set(dataTableAnyOnPage(page, this.selectedEntitiesIds(), this.#keyExp()));
    }

    /** Отметить или снять одну запись; под «отметить все» снятая уходит в исключения. */
    public toggleEntity(entity: ENTITY_TYPE, checked: boolean): void {
        if (!this.isMultiSelect()) {
            this.#selectedEntities.set([entity]);

            return;
        }

        this.#selectedEntities.update((selected: ENTITY_TYPE[]) => dataTableWithEntity(selected, entity, checked, this.#keyExp()));

        if (this.isAcrossPagesEnabled()) {
            this.#excludedEntities.update((excluded: ENTITY_TYPE[]) =>
                dataListExcludedAfterEntity(excluded, entity, checked, this.#keyExp())
            );
            this.#isAllEntitiesSelected.set(!this.excludedEntities().length);
        } else if (!checked) {
            this.#isAllEntitiesSelected.set(false);
        } else {
            // Отметка записи без «отметить все» этого признака не касается.
        }

        this.#updatePageState();
    }

    /** Снять все отметки; исключения остаются до отдельной просьбы приложения. */
    public clearSelectedList(): void {
        this.#selectedEntities.set([]);
        this.#isPageEntitiesSelected.set(false);
        this.#isPageEntitiesIndeterminate.set(false);
        this.#isAllEntitiesSelected.set(false);
        this.#isAcrossPagesEnabled.set(false);
    }

    /** Очистить исключения. */
    public clearExcludedList(): void {
        this.#excludedEntities.set([]);
    }

    /** Пересчитать флажок страницы по показанным строкам. */
    public setExistingEntitiesState(): void {
        const page: ENTITY_TYPE[] = this.#list.entities();
        const keys: ENTITY_TYPE[KEY][] = this.selectedEntitiesIds();

        this.#isPageEntitiesSelected.set(dataTableAllOnPage(page, keys, this.#keyExp()));
        this.#isPageEntitiesIndeterminate.set(dataTableAnyOnPage(page, keys, this.#keyExp()));
    }

    #updatePageState(): void {
        const page: ENTITY_TYPE[] = this.#list.entities();
        const keys: ENTITY_TYPE[KEY][] = this.selectedEntitiesIds();

        if (keys.length) {
            this.#isPageEntitiesSelected.set(dataTableAllOnPage(page, keys, this.#keyExp()));
            this.#isPageEntitiesIndeterminate.set(true);
        } else {
            this.#isPageEntitiesSelected.set(false);
            this.#isPageEntitiesIndeterminate.set(dataTableAnyOnPage(page, keys, this.#keyExp()));
        }
    }

    #keyExp(): KEY {
        return this.#list.keyExp();
    }
}
