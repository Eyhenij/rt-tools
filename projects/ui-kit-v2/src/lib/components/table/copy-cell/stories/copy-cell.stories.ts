import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCopyCellComponent } from './component/test-copy-cell.component';

export default {
    title: 'Components/CopyCell',
    component: TestRtCopyCellComponent,
    argTypes: {
        value: { control: { type: 'text' } },
        variant: {
            options: ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning'],
            control: { type: 'select' },
        },
        revealOnHover: { control: { type: 'boolean' } },
    },
} as Meta<TestRtCopyCellComponent>;

type Story = StoryObj<TestRtCopyCellComponent>;

export const Default: Story = {
    args: {
        value: null,
        variant: 'ghost',
        revealOnHover: true,
    },
};
