import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../showcase';
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

export const Playground: Story = {
    parameters: storySnapshotSkip(
        'число догрузок зависит от того, сколько раз маяк успел войти в область видимости, и от кадра к кадру не повторяется'
    ),
    args: {
        disabled: false,
        rootMargin: '50%',
    },
};
