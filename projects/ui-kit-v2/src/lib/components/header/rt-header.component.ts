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

import { TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconButtonComponent } from '../icon-button';
import { RtLogoComponent } from '../logo';

const BEM_BLOCK: string = 'rt-header';

/**
 * Общий хедер приложения.
 *
 * Слева — slot 35×45 под back-button (rt-icon-button arrow-left, ghost variant),
 * который виден по входному сигналу `canGoBack` и эмитит `backClick`. Когда
 * `canGoBack=false` (default) — slot полностью скрыт через display:none, wordmark
 * выравнивается слева.
 *
 * Далее — wordmark, справа — action-иконки (на базе rt-icon-button с inline
 * override `--rt-icon-button-size: 35px`): опциональная «Пригласить пользователя»
 * (`showInvite`), слот колокольчика и профиль.
 *
 * Колокольчик уведомлений — проекция `[rtHeaderBell]`: домен кладёт в слот
 * `rt-notifications-bell` (общий попап-компонент), хедер про его устройство не знает.
 *
 * Темизация — через семантические `--rt-color-bg-surface` / `--rt-color-text-primary`,
 * dark override карточного фона выполняется в SCSS (header navy совпадает с фоном
 * страницы в dark).
 */
@Component({
    selector: 'rt-header',
    templateUrl: './rt-header.component.html',
    styleUrls: ['./rt-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconButtonComponent,
        RtLogoComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtHeaderComponent {
    public readonly canGoBack: InputSignal<boolean> = input<boolean>(false);

    /** Показывать action-иконку «Пригласить пользователя» слева от колокола. */
    public readonly showInvite: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });

    public readonly backClick: OutputEmitterRef<void> = output<void>();
    public readonly inviteClick: OutputEmitterRef<void> = output<void>();
    public readonly profileClick: OutputEmitterRef<void> = output<void>();

    protected onBackClick(): void {
        this.backClick.emit();
    }

    protected onInviteClick(): void {
        this.inviteClick.emit();
    }

    protected onProfileClick(): void {
        this.profileClick.emit();
    }
}
