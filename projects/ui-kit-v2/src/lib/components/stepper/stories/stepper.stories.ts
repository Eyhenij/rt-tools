import { Meta, StoryObj } from '@storybook/angular';

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
    args: {
        steps: [],
        currentIndex: 0,
    },
};
