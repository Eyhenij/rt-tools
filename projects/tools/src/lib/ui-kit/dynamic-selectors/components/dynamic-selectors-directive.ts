import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, InputSignal, InputSignalWithTransform } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';

import { Nullable, transformStringInput } from '../../../util';

@Directive()
export abstract class RtuiDynamicSelectorsDirective {
    /** Indicates if mobile view */
    public isMobile: InputSignalWithTransform<Nullable<boolean>, boolean> = input.required<Nullable<boolean>, boolean>({
        transform: booleanAttribute,
    });
    /** Selections control button title */
    public buttonTitle: InputSignalWithTransform<string, string> = input<string, string>('Add', {
        transform: transformStringInput,
    });
    /** Indicates if only one option can be chosen */
    public isSingleSelection: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is selector disabled */
    public disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is break string pipe used */
    public useNameBreaking: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is title case pipe used */
    public useTitleCase: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public isPlaceholderIconOutlined: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is delete entity button from the selected list shown */
    public isDeleteButtonShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is list of items draggable */
    public isListDraggable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Placeholder icon */
    public placeholderIcon: InputSignalWithTransform<string, string> = input<string, string>('', {
        transform: transformStringInput,
    });
    /** Placeholder description */
    public placeholderDescription: InputSignalWithTransform<string, string> = input<string, string>('', {
        transform: transformStringInput,
    });
    /** Material elements appearance */
    public appearance: InputSignal<MatFormFieldAppearance> = input('fill' as MatFormFieldAppearance);
}
