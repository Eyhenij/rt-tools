import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtInfiniteScrollDirective } from '../../infinite-scroll.directive';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-infinite-scroll',
    template: `
        <div rtInfiniteScroll [disabled]="disabled" [rootMargin]="rootMargin"></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtInfiniteScrollDirective,
    ],
})
export class TestRtInfiniteScrollComponent {
    public disabled: boolean = false;
    public rootMargin: string = '50%';
}
