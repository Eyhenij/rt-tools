import { Meta, StoryObj } from '@storybook/angular';

import { TestRtInfiniteScrollComponent } from './component/test-infinite-scroll.component';

export default {
    title: 'Components/InfiniteScroll',
    component: TestRtInfiniteScrollComponent,
    argTypes: {
        disabled: { control: { type: 'boolean' } },
        rootMargin: { control: { type: 'text' } },
    },
} as Meta<TestRtInfiniteScrollComponent>;

type Story = StoryObj<TestRtInfiniteScrollComponent>;

export const Default: Story = {
    args: {
        disabled: false,
        rootMargin: '50%',
    },
};
