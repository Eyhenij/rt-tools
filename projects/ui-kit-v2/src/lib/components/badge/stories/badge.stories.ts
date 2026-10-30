import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtBadgeComponent } from './component/test-badge.component';

export default {
    title: 'Atoms/Badge',
    component: TestRtBadgeComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        value: { control: { type: 'text' } },
        overlap: { control: { type: 'boolean' } },
        hidden: { control: { type: 'boolean' } },
        position: { control: { type: 'select' }, options: ['above-after', 'above-before', 'below-after', 'below-before'] },
        size: { control: { type: 'inline-radio' }, options: ['sm', 'md'] },
        color: { control: { type: 'select' }, options: ['primary', 'secondary', 'info', 'success', 'warning', 'danger'] },
    },
} as Meta<TestRtBadgeComponent>;

type TStory = StoryObj<TestRtBadgeComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        label: 'Отели',
        value: '12',
        overlap: false,
        hidden: false,
        position: 'above-after',
        size: 'md',
        color: 'primary',
    },
};
