import { ChangeDetectionStrategy, Component, computed, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { IRtIcon } from '../../../lib/components/icon/rt-icon.model';
import { RtMenuItemComponent } from '../../../lib/components/menu/rt-menu-item.component';
import { RtSelectComponent } from '../../../lib/components/select/rt-select.component';
import { IRtSelect } from '../../../lib/components/select/rt-select.model';

const BEM_BLOCK: string = 'app-profile-menu';

/**
 * Содержимое попапа профиля: кто вошёл и в каком заведении, смена заведения, смена пароля,
 * выход, язык и тема.
 *
 * Отдельный компонент, а не шаблон внутри обёртки: у него своя разметка, свои подписи и свои
 * действия, и инлайном они лежали бы строками в декораторе. Наружу действия уходят событиями —
 * обёртка знает про тему и про то, куда уводит выход, а попап про это знать не должен.
 *
 * Раскладка объявлена в общем слое показа — `showcase/templates/styles/_profile-menu.scss`, — а
 * не в файле стилей рядом: у компонента экрана вне кита он пустой. Оттуда же красится круг под
 * значком темы: он рисуется разметкой `rt-menu-item`, и правило с эмуляцией до чужого шаблона
 * не дотянулось бы.
 *
 * В пакет не уезжает: `src/showcase/**` исключён из сборки библиотеки.
 */
@Component({
    selector: 'app-profile-menu',
    templateUrl: './app-profile-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        RtMenuItemComponent,
        RtSelectComponent,

        // transloco
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class AppProfileMenuComponent {
    /** Показан значок противоположной темы: нажатие переводит к ней. */
    protected readonly themeIcon: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => (this.isDark() ? 'ico-sun' : 'moon'));

    /** Кружок над именем несёт его первую букву: картинки профиля у показа нет. */
    protected readonly avatar: Signal<string> = computed((): string => this.userName().trim().charAt(0).toUpperCase());

    public readonly userName: InputSignal<string> = input<string>('');

    public readonly organizationName: InputSignal<string> = input<string>('');

    public readonly locale: InputSignal<string> = input<string>('');

    public readonly localeOptions: InputSignal<ReadonlyArray<IRtSelect.Option<string>>> = input<ReadonlyArray<IRtSelect.Option<string>>>(
        []
    );

    public readonly isDark: InputSignal<boolean> = input<boolean>(false);

    public readonly canChangeOrganization: InputSignal<boolean> = input<boolean>(false);

    public readonly changeOrganization: OutputEmitterRef<void> = output<void>();

    public readonly localeChange: OutputEmitterRef<string> = output<string>();

    public readonly themeToggled: OutputEmitterRef<void> = output<void>();

    public readonly passwordChange: OutputEmitterRef<void> = output<void>();

    public readonly logout: OutputEmitterRef<void> = output<void>();
}
