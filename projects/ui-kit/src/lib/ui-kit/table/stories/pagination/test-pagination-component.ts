import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';
import { RtuiPaginationComponent } from '../../components';
import { IPageModel } from '@rt-tools/utils';

@Component({
    selector: 'app-test-pagination-component',
    templateUrl: './test-pagination-component.html',
    styleUrls: ['./test-pagination-component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtuiPaginationComponent,

        // directives
        BlockDirective,
    ],
    providers: [],
})
export default class TestPaginationComponent {
    public isMobile: boolean = false;
    public pageModel: IPageModel = {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 100,
        hasPrev: false,
        hasNext: true,
    };

    public onPageModelChange(pageModel: Partial<IPageModel>): void {
        const pageNumber: number | undefined = pageModel.pageNumber;

        if (pageNumber) {
            this.pageModel = {
                ...this.pageModel,
                ...pageModel,
                hasPrev: pageNumber > 1,
                hasNext: pageNumber < this.pageModel.totalCount / this.pageModel.pageSize,
            };
        }
    }
}
