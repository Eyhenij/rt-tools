import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';

@Injectable()
export class RtTableStoreService<ENTITY_TYPE, KEY extends Extract<keyof ENTITY_TYPE, string>> {
    #selectedEntities: WritableSignal<ENTITY_TYPE[]> = signal([]);
    #isAllEntitiesSelected: WritableSignal<boolean> = signal(false);
    #isExistingEntitiesSelected: WritableSignal<boolean> = signal(false);
    #isExistingEntitiesIndeterminate: WritableSignal<boolean> = signal(false);

    /** List of selected entities */
    public readonly selectedEntities: Signal<ENTITY_TYPE[]> = this.#selectedEntities.asReadonly();
    /** List of selected entities ids */
    public readonly selectedEntitiesIds: Signal<ENTITY_TYPE[KEY][]> = computed(() => {
        return this.selectedEntities().map((el: ENTITY_TYPE) => el[this.keyExp()]);
    });
    /** Indicates is all entities selected */
    public readonly isAllEntitiesSelected: Signal<boolean> = this.#isAllEntitiesSelected.asReadonly();
    /** Indicates is all existing entities selected */
    public readonly isExistingEntitiesSelected: Signal<boolean> = this.#isExistingEntitiesSelected.asReadonly();
    /** Indicates is some of existing entities selected */
    public readonly isExistingEntitiesIndeterminate: Signal<boolean> = this.#isExistingEntitiesIndeterminate.asReadonly();

    /** A model's field which should be used for compare */
    public readonly keyExp: WritableSignal<KEY> = signal('id' as KEY);

    /** Change selected list and is all selected state */
    public toggleAll(entities: ENTITY_TYPE[], checked: boolean): void {
        this.#isAllEntitiesSelected.set(checked);

        if (checked) {
            this.#selectedEntities.set(entities);
            this.#isExistingEntitiesSelected.set(true);
            this.#isExistingEntitiesIndeterminate.set(true);
        } else {
            this.#selectedEntities.set([]);
            this.#isExistingEntitiesSelected.set(false);
            this.#isExistingEntitiesIndeterminate.set(false);
        }
    }

    /** Change selected list and is existing selected state */
    public toggleExistingEntities(entities: ENTITY_TYPE[], checked: boolean): void {
        this.#isExistingEntitiesSelected.set(checked);

        if (checked) {
            this.#selectedEntities.update((selected: ENTITY_TYPE[]) => {
                return [...selected, ...entities].filter((el: ENTITY_TYPE, index: number, self: ENTITY_TYPE[]) => {
                    return index === self.findIndex((_: ENTITY_TYPE) => _[this.keyExp()] === el[this.keyExp()]);
                });
            });
        } else {
            this.#selectedEntities.update((selected: ENTITY_TYPE[]) => {
                const removedEntitiesIds: ENTITY_TYPE[KEY][] = entities.map((el: ENTITY_TYPE) => el[this.keyExp()]);
                return selected.filter((el: ENTITY_TYPE) => !removedEntitiesIds.includes(el[this.keyExp()]));
            });
        }

        this.#isExistingEntitiesIndeterminate.set(this.#isOneExist(entities));
    }

    /** Change selected list and is existing selected and is all selected state */
    public toggleEntity(entities: ENTITY_TYPE[], entity: ENTITY_TYPE, checked: boolean): void {
        const updatedList: ENTITY_TYPE[] = [];
        this.selectedEntities().forEach((el: ENTITY_TYPE) => updatedList.push(el));

        if (checked) {
            updatedList.push(entity);
        } else {
            const index: number = this.selectedEntitiesIds().indexOf(entity[this.keyExp()]);
            updatedList.splice(index, 1);
        }

        this.#selectedEntities.set(updatedList);

        if (updatedList?.length) {
            this.#isExistingEntitiesSelected.set(this.#isAllExist(entities));
            this.#isExistingEntitiesIndeterminate.set(true);
        } else {
            this.#isExistingEntitiesSelected.set(false);
            this.#isExistingEntitiesIndeterminate.set(this.#isOneExist(entities));
        }
    }

    /** Set is all selected state */
    public setAllEntitiesState(entities: ENTITY_TYPE[]): void {
        this.#isAllEntitiesSelected.set(this.#isAllExist(entities));
    }

    /** Set is existing selected state */
    public setExistingEntitiesState(entities: ENTITY_TYPE[]): void {
        this.#isExistingEntitiesSelected.set(this.#isAllExist(entities));
        this.#isExistingEntitiesIndeterminate.set(this.#isOneExist(entities));
    }

    #isOneExist(entities: ENTITY_TYPE[]): boolean {
        return !!entities.find((el: ENTITY_TYPE) => this.selectedEntitiesIds().includes(el[this.keyExp()]));
    }

    #isAllExist(entities: ENTITY_TYPE[]): boolean {
        return !entities.find((el: ENTITY_TYPE) => !this.selectedEntitiesIds().includes(el[this.keyExp()]));
    }
}
