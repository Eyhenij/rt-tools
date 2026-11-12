import { ConnectedPosition } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
    computed,
    input,
    output,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { IRtPageHeader } from '../rt-page-header.model';

const BEM_BLOCK: string = 'rt-page-user';

/** Меню профиля из рейки: выше аватара, в 8 от рейки и в 8 от низа окна. */
const RAIL_POSITIONS: readonly ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8, offsetY: -8 },
];

/** Аватар профиля: стоит в подвале рейки и в ряду с вкладками. Меню задаёт приложение. */
@Component({
    selector: 'rt-page-user',
    templateUrl: './rt-page-user.component.html',
    styleUrl: './rt-page-user.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [NgTemplateOutlet, RtIconComponent, RtPopoverDirective, BlockDirective, ElemDirective],
    host: { class: BEM_BLOCK },
})
export class RtPageUserComponent {
    protected readonly letter: Signal<string> = computed((): string => {
        const user: IRtPageHeader.User = this.user();
        return (user.avatar || user.name).charAt(0).toUpperCase();
    });

    protected readonly positions: Signal<readonly ConnectedPosition[] | null> = computed((): readonly ConnectedPosition[] | null =>
        this.placement() === 'rail' ? RAIL_POSITIONS : null
    );

    public readonly user: InputSignal<IRtPageHeader.User> = input.required<IRtPageHeader.User>();

    public readonly userMenu: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null);

    /** Откуда открывается меню: из рейки вправо-вверх или вниз под аватаром. */
    public readonly placement: InputSignal<'rail' | 'bar'> = input<'rail' | 'bar'>('bar');

    public readonly userClick: OutputEmitterRef<void> = output<void>();
}
