import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-money-list';

/**
 * Финансовый блок асайда: суммы и комиссии на subtle-подложке. Контейнер задаёт
 * фон, скругление и компактный gap между `rt-money-row`. Отдельный примитив (не
 * `rt-detail-list`), потому что у денег своя раскладка — значение прижато вправо,
 * суммы не переносятся, есть итоговая строка.
 *
 * Контент — только `rt-money-row` через проекцию.
 */
@Component({
    selector: 'rt-money-list',
    templateUrl: './rt-money-list.component.html',
    styleUrl: './rt-money-list.component.scss',
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
export class RtMoneyListComponent {}
