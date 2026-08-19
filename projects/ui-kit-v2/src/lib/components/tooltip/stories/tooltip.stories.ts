import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtTooltipComponent } from './component/test-tooltip.component';

export default {
    title: 'Atoms/Tooltip',
    component: TestRtTooltipComponent,
    argTypes: {
        text: { control: { type: 'text' } },
        placement: {
            options: ['top', 'bottom'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtTooltipComponent>;

type TStory = StoryObj<TestRtTooltipComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        text: 'Текст подсказки',
        placement: 'top',
    },
};
