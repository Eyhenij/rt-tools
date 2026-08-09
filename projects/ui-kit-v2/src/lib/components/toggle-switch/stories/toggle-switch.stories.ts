import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtToggleSwitchComponent } from './component/test-toggle-switch.component';

export default {
    title: 'Components/ToggleSwitch',
    component: TestRtToggleSwitchComponent,
    argTypes: {
        inputId: { control: { type: 'text' } },
        ariaLabel: { control: { type: 'text' } },
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        iconOff: { control: false },
        iconOn: { control: false },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtToggleSwitchComponent>;

type Story = StoryObj<TestRtToggleSwitchComponent>;

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        inputId: null,
        ariaLabel: null,
        size: 'sm',
        iconOff: null,
        iconOn: null,
        disabled: false,
    },
};
