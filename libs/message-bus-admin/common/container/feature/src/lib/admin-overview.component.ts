import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-overview';

/**
 * Раздел «Обзор» — единственный, который у админки сегодня есть.
 *
 * Стоит он здесь, в общем домене оболочки, а не в своём: раздела с предметом за ним пока нет, и
 * заводить под пустой экран домен из шести слоёв значило бы завести шесть либ, которые нечем
 * наполнить. Списки груза приходят своими доменами, и этот экран уходит вместе с первым из них.
 */
@Component({
    selector: 'admin-overview',
    imports: [RtEmptyStateComponent],
    templateUrl: './admin-overview.component.html',
    styleUrl: './admin-overview.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class AdminOverviewComponent {}
