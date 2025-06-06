import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

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

export const Input: Story = {
    args: {
        isMobile: false,
        isSingleSelection: false,
        isListDraggable: false,
        isAdditionalControlShown: false,
    },
};

export const InputWithAdditional: Story = {
    args: {
        isMobile: false,
        isSingleSelection: false,
        isListDraggable: false,
        isAdditionalControlShown: true,
    },
};

export const InputEditable: Story = {
    args: {
        isMobile: false,
        isSingleSelection: false,
        isListDraggable: false,
        isInputsEditable: true,
        isAdditionalControlShown: false,
    },
};
