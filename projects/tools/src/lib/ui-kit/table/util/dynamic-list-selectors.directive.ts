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

import { transformArrayInput } from '../../../util';
import { RtuiDynamicListComponent } from '../dynamic-list.component';

@Directive({
    standalone: true,
    selector: '[rtDynamicListSelectorsDirective]',
})
export class RtDynamicListSelectorsDirective<
    ENTITY_TYPE extends Record<string, unknown>,
    SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
    KEY extends Extract<keyof ENTITY_TYPE, string>,
> implements OnInit
{
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #injector: Injector = inject(Injector);
    readonly #dynamicListRef: RtuiDynamicListComponent<ENTITY_TYPE, SORT_PROPERTY, KEY> =
        inject<RtuiDynamicListComponent<ENTITY_TYPE, SORT_PROPERTY, KEY>>(RtuiDynamicListComponent);

    public isMultiSelect: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    public isMultiSelectExtendedMod: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    public isSelectAllSelectorShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    public isSelectorsColumnDisabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public selectedEntitiesKeys: InputSignalWithTransform<ENTITY_TYPE[KEY][], ENTITY_TYPE[KEY][]> = input<
        ENTITY_TYPE[KEY][],
        ENTITY_TYPE[KEY][]
    >([], {
        transform: (value: ENTITY_TYPE[KEY][]) => transformArrayInput(value),
    });

    #selectedEntities: WritableSignal<ENTITY_TYPE[]> = signal([]);
    #excludedEntities: WritableSignal<ENTITY_TYPE[]> = signal([]);
    #isAllEntitiesSelected: WritableSignal<boolean> = signal(false);
    #isExistingEntitiesSelected: WritableSignal<boolean> = signal(false);
    #isExistingEntitiesIndeterminate: WritableSignal<boolean> = signal(false);
    #isMultiSelectExtendedModEnabled: WritableSignal<boolean> = signal(false);

    public readonly keyExp: WritableSignal<NonNullable<KEY>> = signal('id' as NonNullable<KEY>);
    public readonly entities: WritableSignal<ENTITY_TYPE[]> = signal([]);
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
    /** Indicates is all entities selected */
    public readonly isAllEntitiesSelected: Signal<boolean> = this.#isAllEntitiesSelected.asReadonly();
    /** Indicates is all existing entities selected */
    public readonly isExistingEntitiesSelected: Signal<boolean> = this.#isExistingEntitiesSelected.asReadonly();
    /** Indicates is some of existing entities selected */
    public readonly isExistingEntitiesIndeterminate: Signal<boolean> = this.#isExistingEntitiesIndeterminate.asReadonly();
    /** Indicates is multi select extended mod enabled */
    public readonly isMultiSelectExtendedModEnabled: Signal<boolean> = this.#isMultiSelectExtendedModEnabled.asReadonly();

    public ngOnInit(): void {
        this.keyExp.set(this.#dynamicListRef.keyExp());

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
            });

        /** Set current entities list and update selectors states */
        effect(
            () => {
                if (this.#dynamicListRef?.tableContainerTpl()) {
                    this.entities.set(this.#dynamicListRef.entities());
                    this.setExistingEntitiesState();
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );

        /** Set all new entities to selected when isMultiSelectExtendedModEnabled */
        effect(
            () => {
                if (this.entities()?.length && this.isMultiSelectExtendedModEnabled()) {
                    this.#selectedEntities.update((list: ENTITY_TYPE[]) => {
                        return [...list, ...this.entities()].filter((el: ENTITY_TYPE, index: number, self: ENTITY_TYPE[]) => {
                            return index === self.findIndex((_: ENTITY_TYPE) => _[this.keyExp()] === el[this.keyExp()]);
                        });
                    });
                    this.#isExistingEntitiesSelected.set(true);
                    this.#isAllEntitiesSelected.set(!this.excludedEntities().length);
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );

        /** Update selectors states */
        effect(
            () => {
                if (this.#dynamicListRef?.tableContainerTpl() && this.#dynamicListRef?.tableTpl() && this.selectedEntities()) {
                    this.#dynamicListRef?.tableContainerTpl()?.isAllEntitiesSelected.set(this.isAllEntitiesSelected());
                    this.#dynamicListRef?.tableContainerTpl()?.isAllEntitiesIndeterminate.set(!!this.selectedEntities()?.length);
                    this.#dynamicListRef?.tableContainerTpl()?.selectedEntitiesCount.set(this.selectedEntities()?.length);
                    this.#dynamicListRef?.tableTpl()?.selectedEntitiesIds.set(this.selectedEntitiesIds());
                    this.#dynamicListRef?.tableTpl()?.isExistingEntitiesSelected.set(this.isExistingEntitiesSelected());
                    this.#dynamicListRef?.tableTpl()?.isExistingEntitiesIndeterminate.set(this.isExistingEntitiesIndeterminate());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );

        /** Table container config */
        effect(
            () => {
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
                if (
                    this.#dynamicListRef?.tableContainerTpl() &&
                    this.#dynamicListRef?.tableContainerTpl()?.isSelectAllSelectorShown() !== this.isSelectAllSelectorShown()
                ) {
                    this.#dynamicListRef?.tableContainerTpl()?.isSelectAllSelectorShown.set(this.isSelectAllSelectorShown());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );

        /** Table config */
        effect(
            () => {
                if (this.#dynamicListRef?.tableTpl()?.isMultiSelect() !== this.isMultiSelect()) {
                    this.#dynamicListRef?.tableTpl()?.isMultiSelect.set(this.isMultiSelect());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
        effect(
            () => {
                if (this.#dynamicListRef.tableTpl()?.onToggleEntity && this.#dynamicListRef.tableTpl()?.onToggleExistingEntities) {
                    this.#dynamicListRef.tableTpl()?.isSelectorsColumnShown.set(true);

                    // @ts-expect-error eslint-disable-next-line
                    this.#dynamicListRef.tableTpl().onToggleEntity = (entity: ENTITY_TYPE, checked: boolean): void =>
                        this.toggleEntity(entity, checked);

                    // @ts-expect-error eslint-disable-next-line
                    this.#dynamicListRef.tableTpl().onToggleExistingEntities = (checked: boolean): void =>
                        this.toggleExistingEntities(checked);
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
        effect(
            () => {
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

    /** Change selected list and is all selected state */
    public toggleAllEntities(checked: boolean): void {
        this.#isAllEntitiesSelected.set(checked);

        if (this.isMultiSelectExtendedMod()) {
            this.#isMultiSelectExtendedModEnabled.set(checked);
        }

        if (checked) {
            this.#selectedEntities.set(this.entities());
            this.#isExistingEntitiesSelected.set(true);
            this.#isExistingEntitiesIndeterminate.set(true);
        } else {
            this.#selectedEntities.set([]);
            this.#isExistingEntitiesSelected.set(false);
            this.#isExistingEntitiesIndeterminate.set(false);
        }
    }

    /** Change selected and excluded lists and set is existing selected and is all selected states */
    public toggleExistingEntities(checked: boolean): void {
        this.#isExistingEntitiesSelected.set(checked);

        if (checked) {
            this.#selectedEntities.update((selected: ENTITY_TYPE[]) => {
                return [...selected, ...this.entities()].filter((el: ENTITY_TYPE, index: number, self: ENTITY_TYPE[]) => {
                    return index === self.findIndex((_: ENTITY_TYPE) => _[this.keyExp()] === el[this.keyExp()]);
                });
            });

            if (this.isMultiSelectExtendedModEnabled()) {
                this.#excludedEntities.update((selected: ENTITY_TYPE[]) => {
                    const removedEntitiesIds: ENTITY_TYPE[KEY][] = this.entities().map((el: ENTITY_TYPE) => el[this.keyExp()]);
                    return selected.filter((el: ENTITY_TYPE) => !removedEntitiesIds.includes(el[this.keyExp()]));
                });
            }
        } else {
            this.#selectedEntities.update((selected: ENTITY_TYPE[]) => {
                const removedEntitiesIds: ENTITY_TYPE[KEY][] = this.entities().map((el: ENTITY_TYPE) => el[this.keyExp()]);
                return selected.filter((el: ENTITY_TYPE) => !removedEntitiesIds.includes(el[this.keyExp()]));
            });

            if (this.isMultiSelectExtendedModEnabled()) {
                this.#excludedEntities.update((selected: ENTITY_TYPE[]) => {
                    return [...selected, ...this.entities()].filter((el: ENTITY_TYPE, index: number, self: ENTITY_TYPE[]) => {
                        return index === self.findIndex((_: ENTITY_TYPE) => _[this.keyExp()] === el[this.keyExp()]);
                    });
                });
            }
            this.#isAllEntitiesSelected.set(false);
        }

        this.#isExistingEntitiesIndeterminate.set(this.#isOneExist());
    }

    /** Change selected and excluded lists and set is existing selected and is all selected states */
    public toggleEntity(entity: ENTITY_TYPE, checked: boolean): void {
        const updatedSelectedList: ENTITY_TYPE[] = [];
        const updatedExcludedList: ENTITY_TYPE[] = [];

        this.selectedEntities().forEach((el: ENTITY_TYPE) => updatedSelectedList.push(el));

        if (this.isMultiSelectExtendedModEnabled()) {
            this.excludedEntities().forEach((el: ENTITY_TYPE) => updatedExcludedList.push(el));
        }

        if (checked) {
            updatedSelectedList.push(entity);

            if (this.isMultiSelectExtendedModEnabled()) {
                const index: number = this.excludedEntitiesIds().indexOf(entity[this.keyExp()]);
                updatedExcludedList.splice(index, 1);
            }
        } else {
            const index: number = this.selectedEntitiesIds().indexOf(entity[this.keyExp()]);
            updatedSelectedList.splice(index, 1);

            if (this.isMultiSelectExtendedModEnabled()) {
                updatedExcludedList.push(entity);
            }

            this.#isAllEntitiesSelected.set(false);
        }

        this.#selectedEntities.set(updatedSelectedList);

        if (this.isMultiSelectExtendedModEnabled()) {
            this.#excludedEntities.set(updatedExcludedList);
        }

        if (updatedSelectedList?.length) {
            this.#isExistingEntitiesSelected.set(this.#isAllExist());
            this.#isExistingEntitiesIndeterminate.set(true);
        } else {
            this.#isExistingEntitiesSelected.set(false);
            this.#isExistingEntitiesIndeterminate.set(this.#isOneExist());
        }
    }

    /** Set is existing selected and indeterminate state */
    public setExistingEntitiesState(): void {
        this.#isExistingEntitiesSelected.set(this.#isAllExist());
        this.#isExistingEntitiesIndeterminate.set(this.#isOneExist());
    }

    #isOneExist(): boolean {
        return !!this.entities().find((el: ENTITY_TYPE) => this.selectedEntitiesIds().includes(el[this.keyExp()]));
    }

    #isAllExist(): boolean {
        return !this.entities().find((el: ENTITY_TYPE) => !this.selectedEntitiesIds().includes(el[this.keyExp()]));
    }
}
