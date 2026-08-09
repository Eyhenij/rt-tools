import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtCheckboxComponent } from './component/test-checkbox.component';

export default {
    title: 'Components/Checkbox',
    component: TestRtCheckboxComponent,
    argTypes: {
        inputId: { control: { type: 'text' } },
        ariaLabel: { control: { type: 'text' } },
        disabled: { control: { type: 'boolean' } },
        indeterminate: { control: { type: 'boolean' } },
    },
} as Meta<TestRtCheckboxComponent>;

type Story = StoryObj<TestRtCheckboxComponent>;

export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        inputId: null,
        ariaLabel: null,
        disabled: false,
        indeterminate: false,
    },
};
