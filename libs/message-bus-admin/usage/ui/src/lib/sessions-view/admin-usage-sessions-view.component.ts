import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { IUsage } from '@rt/message-bus-admin/usage/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtAsideSectionComponent, RtDetailListComponent, RtDetailRowComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-panel';

/**
 * Вид сессий одного скила: строка на сессию — день, признак сессии и сколько раз она загрузила
 * скил, свежий день первым, как их отдаёт приёмник.
 *
 * Признак сессии показан как есть: другого имени у сессии нет, и человек узнаёт её по нему.
 * Пока сессии читаются, вместо строк стоит одна строка со скелетоном: без неё панель на время
 * чтения читалась бы пустой.
 *
 * Своего состояния у вида нет — сессии приходят входом: читает их панель, а показывает он.
 */
@Component({
    selector: 'admin-usage-sessions-view',
    templateUrl: './admin-usage-sessions-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        RtAsideSectionComponent,
        RtDetailListComponent,
        RtDetailRowComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminUsageSessionsViewComponent {
    protected readonly heading: string = adminLabel('detailsUsageSessions');
    protected readonly dayLabel: string = adminLabel('columnDay');
    protected readonly countLabel: string = adminLabel('columnCount');
    protected readonly missing: string = adminLabel('detailsSessionsMissing');

    public readonly rows: InputSignal<readonly IUsage.Session.State[]> = input.required<readonly IUsage.Session.State[]>();
    public readonly reading: InputSignal<boolean> = input<boolean>(false);
}
