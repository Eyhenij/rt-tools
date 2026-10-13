import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    input,
    InputSignalWithTransform,
    Signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { RtColorPaletteComponent } from '../../rt-color-palette.component';

/** Цвета темы приложения — короткий набор, каким его передают входом `colors`. */
const THEME_COLORS: readonly string[] = ['#1e88e5', '#43a047', '#fb8c00', '#e53935', '#8e24aa', '#546e7a'];

/**
 * Демонстрационная обёртка для витрины: держит элемент формы палитры и входы, на которые Storybook
 * вешает контролы. Отключённость — состояние формы, поэтому контрол `disabled` переводит её элемент.
 * В пакет не уезжает.
 */
@Component({
    selector: 'app-color-palette',
    templateUrl: './test-color-palette.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtColorPaletteComponent,
    ],
})
export class TestRtColorPaletteComponent {
    protected readonly control: FormControl<string | null> = new FormControl<string | null>('#43a047');
    protected readonly colors: Signal<readonly string[]> = computed((): readonly string[] => (this.themeColors() ? THEME_COLORS : []));

    public readonly themeColors: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly readonly: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly customAllowed: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    public readonly channels: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    constructor() {
        effect((): void => {
            if (this.disabled()) {
                this.control.disable();
            } else {
                this.control.enable();
            }
        });
    }
}
