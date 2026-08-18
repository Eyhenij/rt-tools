import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { adminLabel, AdminLocaleService, EAdminLocale } from '@rt/message-bus-admin/common/core/util';
import { IRtToggleButtonGroup, RtToggleButtonGroupComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-locale-switch';

/**
 * Языки, между которыми выбирает человек. Подписаны они собой, а не словом «русский» и
 * «английский»: подпись языка, написанная на другом языке, читается хуже, чем его код.
 */
const OPTIONS: ReadonlyArray<IRtToggleButtonGroup.Option<EAdminLocale>> = Object.freeze([
    { value: EAdminLocale.Ru, label: 'RU' },
    { value: EAdminLocale.En, label: 'EN' },
]);

/**
 * Выбор языка подписей кита.
 *
 * Стоит в двух местах — в попапе профиля и на экране входа, — и потому живёт в общем слое: две
 * копии разошлись бы набором языков и видом, а меняет он одно и то же состояние.
 *
 * Языков два, и выбор между двумя рисуется рядом кнопок, а не списком с раскрытием: список
 * прячет второй язык за нажатием, которого он не стоит.
 */
@Component({
    selector: 'admin-locale-switch',
    templateUrl: './admin-locale-switch.component.html',
    styleUrl: './admin-locale-switch.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtToggleButtonGroupComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminLocaleSwitchComponent {
    readonly #locale: AdminLocaleService = inject(AdminLocaleService);

    protected readonly options: ReadonlyArray<IRtToggleButtonGroup.Option<EAdminLocale>> = OPTIONS;

    protected readonly switchLabel: string = adminLabel('languageSwitch');

    protected readonly current: Signal<EAdminLocale> = this.#locale.current;

    protected choose(locale: EAdminLocale): void {
        this.#locale.setLocale(locale);
    }
}
