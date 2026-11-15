import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';

const BEM_BLOCK: string = 'rt-notifications-bell';

const DEFAULT_ICON: string = 'bell';

/**
 * Колокольчик в шапке: открывает ленту событий и показывает точкой, что
 * непрочитанное есть.
 *
 * Маркер — точка, а не число: точное число получатель видит в самой ленте, а
 * двузначное в шапке спорило бы с подписями разделов.
 */
@Component({
    selector: 'rt-notifications-bell',
    templateUrl: './rt-notifications-bell.component.html',
    styleUrl: './rt-notifications-bell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        RtIconComponent,
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtNotificationsBellComponent {
    public readonly unread: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });

    /**
     * Имя значка кита. Та же кнопка шапки с другим значком ставится в слот `[rtHeaderBell]` рядом
     * с колокольчиком — например кнопка помощника со значком `sparkle`. Пустое имя (атрибут без
     * значения) возвращает колокольчик: пустой значок рисовал бы пустую рамку.
     */
    public readonly icon: InputSignalWithTransform<string, string | null | undefined> = input<string, string | null | undefined>(
        DEFAULT_ICON,
        { transform: (name: string | null | undefined): string => name || DEFAULT_ICON }
    );

    public readonly ariaLabel: InputSignal<string> = input<string>('');

    /** Подпись маркера для скринридера: точка сама по себе ничего не говорит */
    public readonly unreadLabel: InputSignal<string> = input<string>('');

    public readonly clicked: OutputEmitterRef<void> = output<void>();

    protected onClick(): void {
        this.clicked.emit();
    }
}
