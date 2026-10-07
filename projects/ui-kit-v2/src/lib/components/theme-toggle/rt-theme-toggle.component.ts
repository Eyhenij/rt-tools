import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { ThemeService } from '@rt-tools/ui-kit-v2/core';

import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtToggleSwitchComponent } from '@rt-tools/ui-kit-v2/toggle-switch';
import { IRtThemeToggle } from './rt-theme-toggle.model';

const BEM_BLOCK: string = 'rt-theme-toggle';

/**
 * Переключатель темы в двух видах (`appearance`):
 *  - `icon` — круглая icon-кнопка, рендер делегирован в `rt-icon-button`
 *    (ghost-стиль, focus-visible, hover, aria-pressed через `[active]`);
 *  - `switch` — тоггл-рельса `rt-toggle-switch` с иконками внутри трека.
 *
 * В обоих видах видна иконка противоположной темы — кликом пользователь
 * переходит к ней. В `switch` это получается само: бегунок стоит над иконкой
 * текущей темы и закрывает её.
 *
 * Инжектит ThemeService напрямую — допустимо благодаря расширенному boundary
 * ThemeService сам провайден root.
 */
@Component({
    selector: 'rt-theme-toggle',
    templateUrl: './rt-theme-toggle.component.html',
    styleUrls: ['./rt-theme-toggle.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        FormsModule,

        // standalone components / directives
        RtIconButtonComponent,
        RtToggleSwitchComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtThemeToggleComponent {
    /** Тексты компонента: сигналы, потому что язык может смениться без перезагрузки */
    readonly #t_themeToggleLabel: Signal<string> = rtKitLabel('themeToggleLabel');

    readonly #theme: ThemeService = inject(ThemeService);

    protected readonly iconName: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => (this.#theme.isDark() ? 'ico-sun' : 'moon'));

    protected readonly isSwitch: Signal<boolean> = computed((): boolean => this.appearance() === 'switch');

    protected readonly isDark: Signal<boolean> = this.#theme.isDark;

    protected readonly label: string = this.#t_themeToggleLabel();

    /** Внешний вид. Default `icon` — компактная кнопка для шапки. */
    public readonly appearance: InputSignal<IRtThemeToggle.Appearance> = input<IRtThemeToggle.Appearance>('icon');

    public onToggle(): void {
        this.#theme.toggle();
    }
}
