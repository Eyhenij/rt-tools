import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IPageModel } from '@rt-tools/utils';

import { RtPaginationComponent } from '../../rt-pagination.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-pagination',
    template: `
        <rt-pagination [pageModel]="pageModel" [perPageOptions]="perPageOptions" [loading]="loading" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtPaginationComponent,
    ],
})
export class TestRtPaginationComponent {
    public pageModel: IPageModel = { pageNumber: 1, pageSize: 20, totalCount: 137 };
    public perPageOptions: ReadonlyArray<number> = [20, 50, 100];
    public loading: boolean = false;
}
