import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { TestCheckboxComponent } from './component/test-checkbox.component';

export default {
    title: 'Components/Checkbox',
    component: TestCheckboxComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
} as Meta<TestCheckboxComponent>;

type Story = StoryObj<TestCheckboxComponent>;

export const Checkbox: Story = {
    args: {
        value: true,
        isIndeterminate: false,
        disabled: false,
        label: 'Label example',
        description: 'Description example',
    },
};
