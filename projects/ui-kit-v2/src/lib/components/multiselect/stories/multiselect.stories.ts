import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMultiselectComponent } from './component/test-multiselect.component';

export default {
    title: 'Components/Multiselect',
    component: TestRtMultiselectComponent,
    argTypes: {
        options: { control: false },
        placeholder: { control: { type: 'text' } },
        maxChips: { control: { type: 'number' } },
    },
} as Meta<TestRtMultiselectComponent>;

type Story = StoryObj<TestRtMultiselectComponent>;

export const Default: Story = {
    args: {
        options: [],
        placeholder: 'Введите значение',
        maxChips: 3,
    },
};
