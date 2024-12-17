import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, InputSignalWithTransform, signal, WritableSignal } from '@angular/core';

import { transformArrayInput } from '../../../util';

@Directive()
export class RtCommonSelectorsDirective<ENTITY_TYPE extends Record<string, unknown>, KEY extends Extract<keyof ENTITY_TYPE, string>> {
    /** Indicates is multiselect available */
    public isMultiSelect: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is 'Select all' checkbox shown  */
    public isSelectorColumnShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is selectors column disabled */
    public isSelectorsColumnDisabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Selected entities Ids on init */
    public selectedEntitiesKeys: InputSignalWithTransform<ENTITY_TYPE[KEY][], ENTITY_TYPE[KEY][]> = input<
        ENTITY_TYPE[KEY][],
        ENTITY_TYPE[KEY][]
    >([], {
        transform: (value: ENTITY_TYPE[KEY][]) => transformArrayInput(value),
    });

    /** Key of ENTITY_TYPE for compare entities */
    public readonly keyExp: WritableSignal<NonNullable<KEY>> = signal('id' as NonNullable<KEY>);
    /** Current list of entities */
    public readonly entities: WritableSignal<ENTITY_TYPE[]> = signal([]);

    /** Add page entities to list exclude duplicates */
    public addPageEntitiesToListExcludeDuplicates(list: ENTITY_TYPE[]): ENTITY_TYPE[] {
        return [...list, ...this.entities()].filter((el: ENTITY_TYPE, index: number, self: ENTITY_TYPE[]) => {
            return index === self.findIndex((_: ENTITY_TYPE) => _[this.keyExp()] === el[this.keyExp()]);
        });
    }

    /** Remove page entities from list */
    public removePageEntitiesFromList(list: ENTITY_TYPE[]): ENTITY_TYPE[] {
        const removedEntitiesIds: ENTITY_TYPE[KEY][] = this.entities().map((el: ENTITY_TYPE) => el[this.keyExp()]);
        return list.filter((el: ENTITY_TYPE) => !removedEntitiesIds.includes(el[this.keyExp()]));
    }

    /** Check is one of page entities exist in selected entities */
    public isOneExistOnPage(selectedEntitiesIds: ENTITY_TYPE[KEY][]): boolean {
        return !!this.entities().find((el: ENTITY_TYPE) => selectedEntitiesIds.includes(el[this.keyExp()]));
    }

    /** Check is all page entities exist in selected entities */
    public isAllExistOnPage(selectedEntitiesIds: ENTITY_TYPE[KEY][]): boolean {
        return !this.entities().find((el: ENTITY_TYPE) => !selectedEntitiesIds.includes(el[this.keyExp()]));
    }
}
