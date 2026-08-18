import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtMenuComponent } from './component/test-menu.component';

export default {
    title: 'Components/Menu',
    component: TestRtMenuComponent,
    argTypes: {
        icon: { control: false },
        ariaLabel: { control: { type: 'text' } },
        align: {
            options: ['start', 'end'],
            control: { type: 'select' },
        },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtMenuComponent>;

type TStory = StoryObj<TestRtMenuComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        icon: 'ellipsis-h',
        ariaLabel: '',
        align: 'end',
        disabled: false,
    },
};
