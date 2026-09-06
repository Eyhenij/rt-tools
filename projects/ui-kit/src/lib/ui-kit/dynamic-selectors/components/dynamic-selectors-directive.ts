import { booleanAttribute, computed, Directive, inject, input, InputSignal, InputSignalWithTransform, Signal } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';

import { transformStringInput } from '@rt-tools/utils';
import { BreakpointService } from '@rt-tools/core';

import { IRtUiConfig, RT_UI_CONFIG } from '../../config';

/** Вид поля, с которым семейство рисовалось до того, как настройка появилась. */
const DEFAULT_APPEARANCE: MatFormFieldAppearance = 'fill';

@Directive()
export abstract class RtuiDynamicSelectorsDirective {
    readonly #breakpoints: BreakpointService = inject(BreakpointService);
    /** App-wide defaults; the resolution order is: instance input → `components.dynamicSelectors` → library default. */
    readonly #config: IRtUiConfig.Config = inject(RT_UI_CONFIG);

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
    /**
     * Material elements appearance.
     *
     * Пустота умолчанием, а не прежнее значение: значение, оставленное умолчанием входа, побеждает
     * настройку всегда — вход задан, и цепочка разрешения на нём кончается, а настройка не
     * срабатывает ни разу и выглядит сломанной.
     */
    public appearance: InputSignal<MatFormFieldAppearance | undefined> = input<MatFormFieldAppearance | undefined>(undefined);

    /**
     * Вид поля, с которым семейство рисуется: вход на месте, потом раздел настройки, потом
     * умолчание кита.
     *
     * Считается один раз здесь, а шаблоны читают готовое: повторённая в каждом из пяти шаблонов
     * семейства, эта цепочка разъехалась бы с настройкой в первом же месте, куда забыли заглянуть.
     */
    public readonly resolvedAppearance: Signal<MatFormFieldAppearance> = computed(
        (): MatFormFieldAppearance => this.appearance() ?? this.#config.components?.dynamicSelectors?.appearance ?? DEFAULT_APPEARANCE
    );
}
