import { Directive, InputSignal, InputSignalWithTransform, booleanAttribute, input } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';

import { Nullable, transformStringInput } from '../../../util';

@Directive({
    standalone: true,
})
export abstract class RtuiDynamicSelectorsDirective {
    /** Selections control button title */
    public buttonTitle: InputSignalWithTransform<string, string> = input.required<string, string>({
        transform: transformStringInput,
    });
    /** Indicates if mobile view */
    public isMobile: InputSignalWithTransform<Nullable<boolean>, boolean> = input.required<Nullable<boolean>, boolean>({
        transform: booleanAttribute,
    });
    /** Indicates if only one option can be chosen */
    public isSingleSelection: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is selector disabled */
    public disabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public useNameBreaking: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isPlaceholderIconOutlined: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is delete entity button from the selected list shown */
    public isDeleteButtonShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
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
