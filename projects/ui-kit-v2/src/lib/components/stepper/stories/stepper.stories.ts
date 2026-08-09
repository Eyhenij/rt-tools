import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtStepperComponent } from './component/test-stepper.component';

export default {
    title: 'Components/Stepper',
    component: TestRtStepperComponent,
    argTypes: {
        steps: { control: false },
        currentIndex: { control: { type: 'number' } },
    },
} as Meta<TestRtStepperComponent>;

type Story = StoryObj<TestRtStepperComponent>;

export const Default: Story = {
    parameters: storySnapshotSkip(
        'обёртка отдаёт пустой `steps`, и в кадре только черта; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        steps: [],
        currentIndex: 0,
    },
};
