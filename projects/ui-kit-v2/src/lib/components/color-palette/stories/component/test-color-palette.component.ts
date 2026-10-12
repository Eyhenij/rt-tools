import { ChangeDetectionStrategy, Component, computed, effect, input, InputSignal, Signal } from '@angular/core';
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

    public readonly themeColors: InputSignal<boolean> = input<boolean>(false);
    public readonly readonly: InputSignal<boolean> = input<boolean>(false);
    public readonly disabled: InputSignal<boolean> = input<boolean>(false);
    public readonly customAllowed: InputSignal<boolean> = input<boolean>(true);
    public readonly channels: InputSignal<boolean> = input<boolean>(false);

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
