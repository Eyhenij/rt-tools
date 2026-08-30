import { booleanAttribute, computed, Directive, inject, input, InputSignal, InputSignalWithTransform, Signal } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';

import { transformStringInput } from '@rt-tools/utils';
import { BreakpointService } from '@rt-tools/core';

@Directive()
export abstract class RtuiDynamicSelectorsDirective {
    readonly #breakpoints: BreakpointService = inject(BreakpointService);

    /** Экран узкий: замер кита, и другого источника у этого признака нет. */
    protected readonly narrow: Signal<boolean> = computed(() => !!this.#breakpoints.isMobile());

    /** Selections control button title */
    public buttonTitle: InputSignalWithTransform<string, string> = input<string, string>('Add', {
        transform: transformStringInput,
    });
    /** Indicates if only one option can be chosen */
    public isSingleSelection: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is selector disabled */
    public disabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is break string pipe used */
    public useNameBreaking: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is title case pipe used */
    public useTitleCase: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isPlaceholderIconOutlined: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is delete entity button from the selected list shown */
    public isDeleteButtonShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is list of items draggable */
    public isListDraggable: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
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
