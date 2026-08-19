import { Meta, StoryObj } from '@storybook/angular';

import { TestRtThreadListComponent } from './component/test-thread-list.component';

export default {
    title: 'Organisms/Chat/ThreadList',
    component: TestRtThreadListComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        rows: { control: false },
        activeId: { control: { type: 'number' } },
        searchPlaceholder: { control: { type: 'text' } },
        emptyText: { control: { type: 'text' } },
        loading: { control: { type: 'boolean' } },
        fetching: { control: { type: 'boolean' } },
        hasMore: { control: { type: 'boolean' } },
        filtersActive: { control: { type: 'boolean' } },
    },
} as Meta<TestRtThreadListComponent>;

type TStory = StoryObj<TestRtThreadListComponent>;

export const Default: TStory = {
    args: {
        rows: [],
        activeId: null,
        searchPlaceholder: '',
        emptyText: 'Ничего не найдено',
        loading: false,
        fetching: false,
        hasMore: false,
        filtersActive: false,
    },
};
