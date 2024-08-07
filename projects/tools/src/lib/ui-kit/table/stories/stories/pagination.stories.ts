import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import TestPaginationComponent from '../pagination/test-pagination-component';

export default {
    title: 'Components/Pagination',
    component: TestPaginationComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
} as Meta<TestPaginationComponent>;

type Story = StoryObj<TestPaginationComponent>;

export const ManyColumns: Story = {
    args: {
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 20,
        },
    },
};
