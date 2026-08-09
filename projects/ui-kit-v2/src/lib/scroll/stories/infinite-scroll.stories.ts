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

export const Default: Story = {
    parameters: storySnapshotSkip(
        'директива висит на пустом `div`, и в кадре нет ни строки; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        disabled: false,
        rootMargin: '50%',
    },
};
