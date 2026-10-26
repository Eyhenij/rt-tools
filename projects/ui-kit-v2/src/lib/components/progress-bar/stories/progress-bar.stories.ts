import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtProgressBarComponent } from './component/test-progress-bar.component';

export default {
    title: 'Atoms/Feedback/ProgressBar',
    component: TestRtProgressBarComponent,
    argTypes: {
        mode: { control: { type: 'inline-radio' }, options: ['determinate', 'indeterminate'] },
        value: { control: { type: 'range', min: -10, max: 110, step: 1 } },
        color: { control: { type: 'select' }, options: ['primary', 'secondary', 'info', 'success', 'warning', 'danger'] },
    },
} as Meta<TestRtProgressBarComponent>;

type TStory = StoryObj<TestRtProgressBarComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        mode: 'determinate',
        value: 40,
        color: 'primary',
    },
};
