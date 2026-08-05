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

import { RtIconComponent } from '../icon/rt-icon.component';

const BEM_BLOCK: string = 'rt-notifications-bell';

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
    host: {
        class: BEM_BLOCK,
    },
})
export class RtNotificationsBellComponent {
    public readonly unread: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });

    public readonly ariaLabel: InputSignal<string> = input<string>('');

    /** Подпись маркера для скринридера: точка сама по себе ничего не говорит */
    public readonly unreadLabel: InputSignal<string> = input<string>('');

    public readonly clicked: OutputEmitterRef<void> = output<void>();

    protected onClick(): void {
        this.clicked.emit();
    }
}
