import { Meta, StoryObj } from '@storybook/angular';

import { TestRtPaginationComponent } from './component/test-pagination.component';

export default {
    title: 'Molecules/Navigation/Pagination',
    component: TestRtPaginationComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        pageModel: { control: false },
        perPageOptions: { control: false },
        loading: { control: { type: 'boolean' } },
    },
} as Meta<TestRtPaginationComponent>;

type TStory = StoryObj<TestRtPaginationComponent>;

export const Playground: TStory = {
    args: {
        pageModel: { pageNumber: 1, pageSize: 20, totalCount: 137 },
        perPageOptions: [20, 50, 100],
        loading: false,
    },
};
