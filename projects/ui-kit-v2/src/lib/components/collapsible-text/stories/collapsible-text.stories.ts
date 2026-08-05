import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCollapsibleTextComponent } from './component/test-collapsible-text.component';

export default {
    title: 'Components/CollapsibleText',
    component: TestRtCollapsibleTextComponent,
    argTypes: {
        paragraphs: { control: false },
        clampLines: { control: { type: 'number' } },
    },
} as Meta<TestRtCollapsibleTextComponent>;

type Story = StoryObj<TestRtCollapsibleTextComponent>;

export const Default: Story = {
    args: {
        paragraphs: ['Первый абзац.', 'Второй абзац.'],
        clampLines: 6,
    },
};
