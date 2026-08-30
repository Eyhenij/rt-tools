import { Meta, StoryObj } from '@storybook/angular';

import { TestCheckboxComponent } from './component/test-checkbox.component';

export default {
    title: 'Components/Checkbox',
    component: TestCheckboxComponent,
} as Meta<TestCheckboxComponent>;

type TStory = StoryObj<TestCheckboxComponent>;

export const Checkbox: TStory = {
    args: {
        value: true,
        isIndeterminate: false,
        disabled: false,
        label: 'Label example',
        description: 'Description example',
    },
};
