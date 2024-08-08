import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BlockDirective } from '../../../../bem';
import { RtuiPaginationComponent } from '../../components';
import { PageModel } from '../../util';

@Component({
    standalone: true,
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
    public pageModel: PageModel = {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 100,
        hasPrev: false,
        hasNext: true,
    };

    public onPageModelChange(pageModel: Partial<PageModel>): void {
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
