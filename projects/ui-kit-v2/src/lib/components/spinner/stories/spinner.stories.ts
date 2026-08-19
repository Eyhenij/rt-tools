import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtSpinnerComponent } from './component/test-spinner.component';

export default {
    title: 'Atoms/Feedback/Spinner',
    component: TestRtSpinnerComponent,
    argTypes: {
        diameter: { control: { type: 'number' } },
        color: {
            options: ['primary', 'neutral', 'on-primary'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtSpinnerComponent>;

type TStory = StoryObj<TestRtSpinnerComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        diameter: 32,
        color: 'primary',
    },
};
