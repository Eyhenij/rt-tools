import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-detail-list';

/**
 * Контейнер для стопки `rt-detail-row` — задаёт единый вертикальный gap между
 * строками «лейбл + значение». Используется в read-only details-панелях асайдов
 * (детали заявки, профиля) вместо самопальных `div`-обёрток.
 *
 * Контент — только `rt-detail-row` через проекцию.
 */
@Component({
    selector: 'rt-detail-list',
    templateUrl: './rt-detail-list.component.html',
    styleUrl: './rt-detail-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtDetailListComponent {}
