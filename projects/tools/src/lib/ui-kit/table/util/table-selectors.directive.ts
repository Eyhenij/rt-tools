import { DestroyRef, Directive, Injector, OnInit, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { filter, switchMap, take } from 'rxjs/operators';

import { RtuiTableComponent } from '../components';
import { RtCommonSelectorsDirective } from './common-selectors.directive';

@Directive({
    standalone: true,
    selector: 'rtui-table[rtTableSelectorsDirective]',
})
export class RtTableSelectorsDirective<
        ENTITY_TYPE extends Record<string, unknown>,
        SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
        KEY extends Extract<keyof ENTITY_TYPE, string>,
    >
    extends RtCommonSelectorsDirective<ENTITY_TYPE, KEY>
    implements OnInit
{
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #injector: Injector = inject(Injector);
    readonly #tableRef: RtuiTableComponent<ENTITY_TYPE, SORT_PROPERTY, KEY> =
        inject<RtuiTableComponent<ENTITY_TYPE, SORT_PROPERTY, KEY>>(RtuiTableComponent);

    /** List of selected entities for processing */
    #selectedEntities: WritableSignal<ENTITY_TYPE[]> = signal([]);
    /** List of excluded entities for processing */
    /** Indicates is all page entities checkbox selected  for processing */
    #isPageEntitiesSelected: WritableSignal<boolean> = signal(false);
    /** Indicates is page entities checkbox indeterminate  for processing */
    #isPageEntitiesIndeterminate: WritableSignal<boolean> = signal(false);

    /** List of selected entities */
    public readonly selectedEntities: Signal<ENTITY_TYPE[]> = this.#selectedEntities.asReadonly();
    /** List of selected entities ids */
    public readonly selectedEntitiesIds: Signal<ENTITY_TYPE[KEY][]> = computed(() => {
        return this.selectedEntities().map((el: ENTITY_TYPE) => el[this.keyExp()]);
    });
    /** Indicates is all page entities checkbox selected */
    public readonly isPageEntitiesSelected: Signal<boolean> = this.#isPageEntitiesSelected.asReadonly();
    /** Indicates is page entities checkbox indeterminate */
    public readonly isPageEntitiesIndeterminate: Signal<boolean> = this.#isPageEntitiesIndeterminate.asReadonly();

    public ngOnInit(): void {
        /** Set current key */
        this.keyExp.set(this.#tableRef.keyExp());

        /** Set current, selected and excluded entities lists and update selectors states */
        toObservable(this.#tableRef?.entities, { injector: this.#injector })
            .pipe(takeUntilDestroyed(this.#destroyRef))
            .subscribe((list: ENTITY_TYPE[]) => {
                this.entities.set(list);
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
                if (this.#tableRef && this.selectedEntities()) {
                    this.#tableRef?.selectedEntitiesIds.set(this.selectedEntitiesIds());
                    this.#tableRef?.isPageEntitiesSelected.set(this.isPageEntitiesSelected());
                    this.#tableRef?.isPageEntitiesIndeterminate.set(this.isPageEntitiesIndeterminate());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );

        /** Table config */
        effect(
            () => {
                /** Set 'isMultiSelect' indicator state in TableComponent  */
                if (this.#tableRef?.isMultiSelect() !== this.isMultiSelect()) {
                    this.#tableRef?.isMultiSelect.set(this.isMultiSelect());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
        effect(
            () => {
                /** Set 'onToggleExistingEntities' and 'onToggleEntity' methods and 'isSelectorsColumnShown' indicator state in TableComponent  */
                if (this.#tableRef) {
                    this.#tableRef?.isSelectorsColumnShown.set(this.isSelectorColumnShown());
                    this.#tableRef.onToggleEntity = (entity: ENTITY_TYPE, checked: boolean): void => this.toggleEntity(entity, checked);
                    this.#tableRef.onTogglePageEntities = (checked: boolean): void => this.togglePageEntities(checked);
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
        effect(
            () => {
                /** Set 'isSelectorsColumnDisabled' indicator state in TableComponent  */
                if (this.#tableRef?.isSelectorsColumnDisabled() !== this.isSelectorsColumnDisabled()) {
                    this.#tableRef?.isSelectorsColumnDisabled.set(this.isSelectorsColumnDisabled());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
    }

    /** Change selected and excluded lists, set 'isPageEntitiesSelected' and 'isAllEntitiesSelected' indicators states */
    public togglePageEntities(checked: boolean): void {
        /** Set 'isPageEntitiesSelected' indicator state */
        this.#isPageEntitiesSelected.set(checked);

        if (checked) {
            /** Add page entities to selected list */
            this.#selectedEntities.update((selected: ENTITY_TYPE[]) => this.addPageEntitiesToListExcludeDuplicates(selected));
        } else {
            /** Remove page entities from selected list */
            this.#selectedEntities.update((selected: ENTITY_TYPE[]) => this.removePageEntitiesFromList(selected));
        }

        /** Set 'isPageEntitiesIndeterminate' indicator state */
        this.#isPageEntitiesIndeterminate.set(this.isOneExistOnPage(this.selectedEntitiesIds()));
    }

    /** Change selected and excluded lists and set is existing selected and is all selected states */
    public toggleEntity(entity: ENTITY_TYPE, checked: boolean): void {
        const updatedSelectedList: ENTITY_TYPE[] = [];

        /** Fill updatedSelectedList  */
        this.selectedEntities().forEach((el: ENTITY_TYPE) => updatedSelectedList.push(el));

        if (checked) {
            /** Add entity to selected list */
            updatedSelectedList.push(entity);
        } else {
            /** Remove entity from selected list */
            const index: number = this.selectedEntitiesIds().indexOf(entity[this.keyExp()]);
            updatedSelectedList.splice(index, 1);
        }

        /** Change selected list  */
        this.#selectedEntities.set(updatedSelectedList);

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
    }

    /** Set is existing selected and indeterminate state */
    public setExistingEntitiesState(): void {
        this.#isPageEntitiesSelected.set(this.isAllExistOnPage(this.selectedEntitiesIds()));
        this.#isPageEntitiesIndeterminate.set(this.isOneExistOnPage(this.selectedEntitiesIds()));
    }
}
