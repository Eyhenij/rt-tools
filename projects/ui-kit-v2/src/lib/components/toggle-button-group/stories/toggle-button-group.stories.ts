import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtToggleButtonGroupComponent } from './component/test-toggle-button-group.component';

export default {
    title: 'Components/ToggleButtonGroup',
    component: TestRtToggleButtonGroupComponent,
    argTypes: {
        options: { control: false },
        value: { control: { type: 'text' } },
        ariaLabel: { control: { type: 'text' } },
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        disabled: { control: { type: 'boolean' } },
        fullWidth: { control: { type: 'boolean' } },
    },
} as Meta<TestRtToggleButtonGroupComponent>;

type Story = StoryObj<TestRtToggleButtonGroupComponent>;

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        options: [],
        value: undefined,
        ariaLabel: null,
        size: 'sm',
        disabled: false,
        fullWidth: false,
    },
};
