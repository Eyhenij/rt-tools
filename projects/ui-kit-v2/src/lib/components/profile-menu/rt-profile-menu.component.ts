import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    inject,
    input,
    output,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { IRtIcon, RT_KIT_LABELS, ThemeService, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';

import { RtMenuItemComponent } from '@rt-tools/ui-kit-v2/menu';
import { RtSelectComponent } from '@rt-tools/ui-kit-v2/select';
import { IRtProfileMenu } from './rt-profile-menu.model';

const BEM_BLOCK: string = 'rt-profile-menu';

/**
 * Содержимое попапа профиля в шапке `rt-page-header`: кто вошёл и в какой организации, действия с
 * учётной записью, язык и тема.
 *
 * Свою панель меню рисует само — фон, рамку, скругление и тень: поповер кита оформления не даёт,
 * и голые пункты в нём легли бы прямо поверх страницы.
 *
 * Тему переключает `ThemeService`, как у `rt-theme-toggle`: служба одна на страницу, и вход
 * только повторял бы её. Куда ведут остальные действия, решает приложение — они уходят выходами.
 *
 * Стили без инкапсуляции: попап рисуется в перекрытии, у конца `<body>`, и правило по классу блока
 * достаёт до него, а до разметки `rt-menu-item` — тоже.
 */
@Component({
    selector: 'rt-profile-menu',
    templateUrl: './rt-profile-menu.component.html',
    styleUrls: ['./rt-profile-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,

        // standalone components / directives
        RtMenuItemComponent,
        RtSelectComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtProfileMenuComponent {
    readonly #theme: ThemeService = inject(ThemeService);

    /** Подписи кита: сигнал, потому что язык может смениться без перезагрузки. */
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    /** Показан значок противоположной темы: нажатие переводит к ней. */
    protected readonly themeIcon: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => (this.#theme.isDark() ? 'ico-sun' : 'moon'));

    /** Круг над именем несёт его первую букву: картинки профиля у кита нет. */
    protected readonly avatar: Signal<string> = computed((): string => this.userName().trim().charAt(0).toUpperCase());

    public readonly userName: InputSignal<string> = input<string>('');

    /** Пустое название — строки организации нет. */
    public readonly organizationName: InputSignal<string> = input<string>('');

    public readonly organizationChange: InputSignal<IRtProfileMenu.OrganizationChange> = input<IRtProfileMenu.OrganizationChange>('hidden');

    public readonly passwordChange: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Пустой список — переключателя языка нет. */
    public readonly locales: InputSignal<ReadonlyArray<IRtProfileMenu.Locale>> = input<ReadonlyArray<IRtProfileMenu.Locale>>([]);

    public readonly locale: InputSignal<string> = input<string>('');

    /** Выход недоступен, пока приложение его уже ведёт. */
    public readonly signOutDisabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly changeOrganization: OutputEmitterRef<void> = output<void>();

    public readonly changePassword: OutputEmitterRef<void> = output<void>();

    public readonly localeChange: OutputEmitterRef<string> = output<string>();

    public readonly signOut: OutputEmitterRef<void> = output<void>();

    public onToggleTheme(): void {
        this.#theme.toggle();
    }
}
