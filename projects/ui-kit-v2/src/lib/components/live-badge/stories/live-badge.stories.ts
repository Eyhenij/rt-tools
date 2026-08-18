import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtLiveBadgeComponent } from './component/test-live-badge.component';

export default {
    title: 'Components/LiveBadge',
    component: TestRtLiveBadgeComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        count: { control: { type: 'number' } },
        active: { control: { type: 'boolean' } },
    },
} as Meta<TestRtLiveBadgeComponent>;

type TStory = StoryObj<TestRtLiveBadgeComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        label: 'Смотрят сейчас',
        count: 128,
        active: true,
    },
};
