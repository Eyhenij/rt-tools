import {
    DestroyRef,
    Directive,
    Injector,
    InputSignalWithTransform,
    OnInit,
    Signal,
    WritableSignal,
    booleanAttribute,
    computed,
    effect,
    inject,
    input,
    signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { filter, switchMap, take } from 'rxjs/operators';

import { RtuiDynamicListComponent } from '../dynamic-list.component';
import { RtCommonSelectorsDirective } from './common-selectors.directive';

@Directive({
    standalone: true,
    selector: 'rtui-dynamic-list[rtDynamicListSelectorsDirective]',
})
export class RtDynamicListSelectorsDirective<
        ENTITY_TYPE extends Record<string, unknown>,
        SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
        KEY extends Extract<keyof ENTITY_TYPE, string>,
    >
    extends RtCommonSelectorsDirective<ENTITY_TYPE, KEY>
    implements OnInit
{
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #injector: Injector = inject(Injector);
    readonly #dynamicListRef: RtuiDynamicListComponent<ENTITY_TYPE, SORT_PROPERTY, KEY> =
        inject<RtuiDynamicListComponent<ENTITY_TYPE, SORT_PROPERTY, KEY>>(RtuiDynamicListComponent);

    /** Indicates is multiselect extended mod available (use selected and excluded lists) */
    public isMultiSelectExtendedMod: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is 'Select all' checkbox shown  */
    public isSelectAllSelectorShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });

    /** List of selected entities for processing */
    #selectedEntities: WritableSignal<ENTITY_TYPE[]> = signal([]);
    /** List of excluded entities for processing */
    #excludedEntities: WritableSignal<ENTITY_TYPE[]> = signal([]);
    /** Indicates is 'Select all' checkbox selected  for processing */
    #isAllEntitiesSelected: WritableSignal<boolean> = signal(false);
    /** Indicates is all page entities checkbox selected  for processing */
    #isPageEntitiesSelected: WritableSignal<boolean> = signal(false);
    /** Indicates is page entities checkbox indeterminate  for processing */
    #isPageEntitiesIndeterminate: WritableSignal<boolean> = signal(false);
    /** Indicates is multi select extended mod enabled  for processing */
    #isMultiSelectExtendedModEnabled: WritableSignal<boolean> = signal(false);

    /** List of selected entities */
    public readonly selectedEntities: Signal<ENTITY_TYPE[]> = this.#selectedEntities.asReadonly();
    /** List of excluded entities */
    public readonly excludedEntities: Signal<ENTITY_TYPE[]> = this.#excludedEntities.asReadonly();
    /** List of selected entities ids */
    public readonly selectedEntitiesIds: Signal<ENTITY_TYPE[KEY][]> = computed(() => {
        return this.selectedEntities().map((el: ENTITY_TYPE) => el[this.keyExp()]);
    });
    /** List of excluded entities ids */
    public readonly excludedEntitiesIds: Signal<ENTITY_TYPE[KEY][]> = computed(() => {
        return this.excludedEntities().map((el: ENTITY_TYPE) => el[this.keyExp()]);
    });
    /** Indicates is 'Select All' checkbox selected */
    public readonly isAllEntitiesSelected: Signal<boolean> = this.#isAllEntitiesSelected.asReadonly();
    /** Indicates is all page entities checkbox selected */
    public readonly isPageEntitiesSelected: Signal<boolean> = this.#isPageEntitiesSelected.asReadonly();
    /** Indicates is page entities checkbox indeterminate */
    public readonly isPageEntitiesIndeterminate: Signal<boolean> = this.#isPageEntitiesIndeterminate.asReadonly();
    /** Indicates is multi select extended mod enabled */
    public readonly isMultiSelectExtendedModEnabled: Signal<boolean> = this.#isMultiSelectExtendedModEnabled.asReadonly();

    public ngOnInit(): void {
        /** Set current key */
        this.keyExp.set(this.#dynamicListRef.keyExp());

        /** Set current, selected and excluded entities lists and update selectors states */
        toObservable(this.#dynamicListRef?.entities, { injector: this.#injector })
            .pipe(takeUntilDestroyed(this.#destroyRef))
            .subscribe((list: ENTITY_TYPE[]) => {
                this.entities.set(list);

                if (this.isMultiSelectExtendedModEnabled()) {
                    this.#selectedEntities.update((selected: ENTITY_TYPE[]) => this.addPageEntitiesToListExcludeDuplicates(selected));
                    this.#isPageEntitiesSelected.set(!this.excludedEntities().length);
                    this.#isAllEntitiesSelected.set(!this.excludedEntities().length);
                }
            });

        /** Set initial selected entities */
        toObservable(this.entities, { injector: this.#injector })
            .pipe(
                filter((list: ENTITY_TYPE[]) => !!list?.length),
                take(1),
                switchMap(() =>
                    toObservable(this.selectedEntitiesKeys, { injector: this.#injector }).pipe(
                        filter((list: ENTITY_TYPE[KEY][]) => !!list?.length),
                        take(1)
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe(() => {
                this.#selectedEntities.set(
                    this.entities().filter((el: ENTITY_TYPE) => this.selectedEntitiesKeys().includes(el[this.keyExp()]))
                );
                this.setExistingEntitiesState();
            });

        /** Update selectors states and list of selected entities ids in children components */
        effect(
            () => {
                if (this.#dynamicListRef?.tableContainerTpl() && this.#dynamicListRef?.tableTpl() && this.selectedEntities()) {
                    this.#dynamicListRef?.tableContainerTpl()?.isAllEntitiesSelected.set(this.isAllEntitiesSelected());
                    this.#dynamicListRef?.tableContainerTpl()?.isAllEntitiesIndeterminate.set(!!this.selectedEntities()?.length);
                    this.#dynamicListRef?.tableContainerTpl()?.selectedEntitiesCount.set(this.selectedEntities()?.length);
                    this.#dynamicListRef?.tableTpl()?.selectedEntitiesIds.set(this.selectedEntitiesIds());
                    this.#dynamicListRef?.tableTpl()?.isPageEntitiesSelected.set(this.isPageEntitiesSelected());
                    this.#dynamicListRef?.tableTpl()?.isPageEntitiesIndeterminate.set(this.isPageEntitiesIndeterminate());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );

        /** Table container config */
        effect(
            () => {
                /** Set 'onToggleAllEntities' method in TableContainerComponent  */
                if (this.#dynamicListRef.tableContainerTpl()?.onToggleAllEntities) {
                    // @ts-expect-error eslint-disable-next-line
                    this.#dynamicListRef.tableContainerTpl().onToggleAllEntities = (checked: boolean): void =>
                        this.toggleAllEntities(checked);
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
        effect(
            () => {
                /** Set 'isMultiSelect' indicator state in TableContainerComponent  */
                if (
                    this.#dynamicListRef?.tableContainerTpl() &&
                    this.#dynamicListRef?.tableContainerTpl()?.isMultiSelect() !== this.isMultiSelect()
                ) {
                    this.#dynamicListRef?.tableContainerTpl()?.isMultiSelect.set(this.isMultiSelect());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
        effect(
            () => {
                /** Set 'isSelectAllSelectorShown' indicator state in TableContainerComponent  */
                if (
                    this.#dynamicListRef?.tableContainerTpl() &&
                    this.#dynamicListRef?.tableContainerTpl()?.isSelectAllSelectorShown() !== this.isSelectAllSelectorShown()
                ) {
                    this.#dynamicListRef?.tableContainerTpl()?.isSelectAllSelectorShown.set(this.isSelectAllSelectorShown());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );

        effect(
            () => {
                /** Set 'isSelectAllSelectorDisabled' indicator state in TableContainerComponent  */
                if (
                    this.#dynamicListRef?.tableContainerTpl() &&
                    this.#dynamicListRef?.tableContainerTpl()?.isSelectAllSelectorDisabled() !== this.isSelectorsColumnDisabled()
                ) {
                    this.#dynamicListRef?.tableContainerTpl()?.isSelectAllSelectorDisabled.set(this.isSelectorsColumnDisabled());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );

        /** Table config */
        effect(
            () => {
                /** Set 'isMultiSelect' indicator state in TableComponent  */
                if (this.#dynamicListRef?.tableTpl()?.isMultiSelect() !== this.isMultiSelect()) {
                    this.#dynamicListRef?.tableTpl()?.isMultiSelect.set(this.isMultiSelect());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
        effect(
            () => {
                /** Set 'onToggleExistingEntities' and 'onToggleEntity' methods and 'isSelectorsColumnShown' indicator state in TableComponent  */
                if (this.#dynamicListRef.tableTpl()) {
                    this.#dynamicListRef.tableTpl()?.isSelectorsColumnShown.set(true);

                    // @ts-expect-error eslint-disable-next-line
                    this.#dynamicListRef.tableTpl().onToggleEntity = (entity: ENTITY_TYPE, checked: boolean): void =>
                        this.toggleEntity(entity, checked);

                    // @ts-expect-error eslint-disable-next-line
                    this.#dynamicListRef.tableTpl().onTogglePageEntities = (checked: boolean): void => this.togglePageEntities(checked);
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
        effect(
            () => {
                /** Set 'isSelectorsColumnDisabled' indicator state in TableComponent  */
                if (
                    this.#dynamicListRef?.tableTpl() &&
                    this.#dynamicListRef?.tableTpl()?.isSelectorsColumnDisabled() !== this.isSelectorsColumnDisabled()
                ) {
                    this.#dynamicListRef?.tableTpl()?.isSelectorsColumnDisabled.set(this.isSelectorsColumnDisabled());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
    }

    /** Change selected entities list and 'isAllEntitiesSelected' indicator state */
    public toggleAllEntities(checked: boolean): void {
        this.#isAllEntitiesSelected.set(checked);

        if (this.isMultiSelectExtendedMod()) {
            this.#isMultiSelectExtendedModEnabled.set(checked);
        }

        if (checked) {
            this.#selectedEntities.set(this.entities());
            this.#isPageEntitiesSelected.set(true);
            this.#isPageEntitiesIndeterminate.set(true);
        } else {
            this.#selectedEntities.set([]);
            this.#isPageEntitiesSelected.set(false);
            this.#isPageEntitiesIndeterminate.set(false);
        }
    }

    /** Change selected and excluded lists, set 'isPageEntitiesSelected' and 'isAllEntitiesSelected' indicators states */
    public togglePageEntities(checked: boolean): void {
        /** Set 'isPageEntitiesSelected' indicator state */
        this.#isPageEntitiesSelected.set(checked);

        if (checked) {
            /** Add page entities to selected list */
            this.#selectedEntities.update((selected: ENTITY_TYPE[]) => this.addPageEntitiesToListExcludeDuplicates(selected));

            /** Remove page entities from excluded list */
            if (this.isMultiSelectExtendedModEnabled()) {
                this.#excludedEntities.update((selected: ENTITY_TYPE[]) => this.removePageEntitiesFromList(selected));

                /** Set 'isAllEntitiesSelected' indicator state */
                this.#isAllEntitiesSelected.set(!this.excludedEntities()?.length);
            }
        } else {
            /** Remove page entities from selected list */
            this.#selectedEntities.update((selected: ENTITY_TYPE[]) => this.removePageEntitiesFromList(selected));

            /** Add page entities to excluded list */
            if (this.isMultiSelectExtendedModEnabled()) {
                this.#excludedEntities.update((selected: ENTITY_TYPE[]) => this.addPageEntitiesToListExcludeDuplicates(selected));
            }
            /** Set 'isAllEntitiesSelected' indicator state */
            this.#isAllEntitiesSelected.set(false);
        }

        /** Set 'isPageEntitiesIndeterminate' indicator state */
        this.#isPageEntitiesIndeterminate.set(this.isOneExistOnPage(this.selectedEntitiesIds()));
    }

    /** Change selected and excluded lists and set is existing selected and is all selected states */
    public toggleEntity(entity: ENTITY_TYPE, checked: boolean): void {
        const updatedSelectedList: ENTITY_TYPE[] = [];
        const updatedExcludedList: ENTITY_TYPE[] = [];

        /** Fill updatedSelectedList  */
        this.selectedEntities().forEach((el: ENTITY_TYPE) => updatedSelectedList.push(el));

        /** Fill updatedExcludedList  */
        if (this.isMultiSelectExtendedModEnabled()) {
            this.excludedEntities().forEach((el: ENTITY_TYPE) => updatedExcludedList.push(el));
        }

        if (checked) {
            /** Add entity to selected list */
            updatedSelectedList.push(entity);

            /** Remove entity from excluded list */
            if (this.isMultiSelectExtendedModEnabled()) {
                const index: number = this.excludedEntitiesIds().indexOf(entity[this.keyExp()]);
                updatedExcludedList.splice(index, 1);
            }
        } else {
            /** Remove entity from selected list */
            const index: number = this.selectedEntitiesIds().indexOf(entity[this.keyExp()]);
            updatedSelectedList.splice(index, 1);

            /** Add entity to excluded list */
            if (this.isMultiSelectExtendedModEnabled()) {
                updatedExcludedList.push(entity);
            }

            /** Set 'isAllEntitiesSelected' indicator state */
            this.#isAllEntitiesSelected.set(false);
        }

        /** Change selected list  */
        this.#selectedEntities.set(updatedSelectedList);

        /** Change excluded list  */
        if (this.isMultiSelectExtendedModEnabled()) {
            this.#excludedEntities.set(updatedExcludedList);

            /** Set 'isAllEntitiesSelected' indicator state */
            this.#isAllEntitiesSelected.set(!this.excludedEntities()?.length);
        }

        /** Set 'isPageEntitiesSelected' and 'isPageEntitiesIndeterminate' indicators states */
        if (updatedSelectedList?.length) {
            this.#isPageEntitiesSelected.set(this.isAllExistOnPage(this.selectedEntitiesIds()));
            this.#isPageEntitiesIndeterminate.set(true);
        } else {
            this.#isPageEntitiesSelected.set(false);
            this.#isPageEntitiesIndeterminate.set(this.isOneExistOnPage(this.selectedEntitiesIds()));
        }
    }

    /** Clear selected list */
    public clearSelectedList(): void {
        this.#selectedEntities.set([]);
        this.#isPageEntitiesSelected.set(false);
        this.#isPageEntitiesIndeterminate.set(false);
        this.#isAllEntitiesSelected.set(false);
    }

    /** Clear excluded list */
    public clearExcludedList(): void {
        this.#excludedEntities.set([]);
    }

    /** Set is existing selected and indeterminate state */
    public setExistingEntitiesState(): void {
        this.#isPageEntitiesSelected.set(this.isAllExistOnPage(this.selectedEntitiesIds()));
        this.#isPageEntitiesIndeterminate.set(this.isOneExistOnPage(this.selectedEntitiesIds()));
    }
}
