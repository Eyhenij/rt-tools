import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { TestDynamicInputComponent } from '../strories/component/input/test-dynamic-input.component';

export default {
    title: 'Components/DynamicInput',
    component: TestDynamicInputComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
    argTypes: {},
} as Meta<TestDynamicInputComponent>;

type Story = StoryObj<TestDynamicInputComponent>;

export const DynamicInput: Story = {
    args: {
        isMobile: false,
        isSingleSelection: false,
    },
};
