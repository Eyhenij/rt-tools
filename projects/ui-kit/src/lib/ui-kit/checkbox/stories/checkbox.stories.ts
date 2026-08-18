// eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { TestCheckboxComponent } from './component/test-checkbox.component';

export default {
    title: 'Components/Checkbox',
    component: TestCheckboxComponent,
    decorators: [
        applicationConfig({
            // eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
            providers: [provideAnimations()],
        }),
    ],
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
