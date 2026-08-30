import { Meta, StoryObj } from '@storybook/angular';

import { TestDynamicInputComponent } from '../strories/component/input/test-dynamic-input.component';

export default {
    title: 'Components/DynamicInput',
    component: TestDynamicInputComponent,
    argTypes: {},
} as Meta<TestDynamicInputComponent>;

type TStory = StoryObj<TestDynamicInputComponent>;

export const Input: TStory = {
    args: {
        isMobile: false,
        isSingleSelection: false,
        isListDraggable: false,
        isAdditionalControlShown: false,
    },
};

export const InputWithAdditional: TStory = {
    args: {
        isMobile: false,
        isSingleSelection: false,
        isListDraggable: false,
        isAdditionalControlShown: true,
    },
};

export const InputEditable: TStory = {
    args: {
        isMobile: false,
        isSingleSelection: false,
        isListDraggable: false,
        isInputsEditable: true,
        isAdditionalControlShown: false,
    },
};
