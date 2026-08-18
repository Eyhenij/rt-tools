// eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { TestDynamicInputComponent } from '../strories/component/input/test-dynamic-input.component';

export default {
    title: 'Components/DynamicInput',
    component: TestDynamicInputComponent,
    decorators: [
        applicationConfig({
            // eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
            providers: [provideAnimations()],
        }),
    ],
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
