import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import TestPaginationComponent from '../pagination/test-pagination-component';

export default {
    title: 'Components/Pagination',
    component: TestPaginationComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
} as Meta<TestPaginationComponent>;

type Story = StoryObj<TestPaginationComponent>;

export const Pagination: Story = {
    args: {
        isMobile: false,
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 10000,
            hasPrev: false,
            hasNext: true,
        },
    },
};
