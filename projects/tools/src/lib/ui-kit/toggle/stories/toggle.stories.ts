import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { TOGGLE_SIZE_TYPE_ENUM } from '../toggle-size.type.enum';
import { TestToggleComponent } from './component/test-toggle.component';

export default {
    title: 'Components/Toggle',
    component: TestToggleComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
    argTypes: {
        size: {
            type: 'string',
            options: [TOGGLE_SIZE_TYPE_ENUM.MD, TOGGLE_SIZE_TYPE_ENUM.SM, 'fat'],
            control: { type: 'select' },
        },
    },
} as Meta<TestToggleComponent>;

type Story = StoryObj<TestToggleComponent>;

export const Toggle: Story = {
    args: {
        value: true,
        disabled: false,
        tooltipDisabled: false,
        size: TOGGLE_SIZE_TYPE_ENUM.MD,
        label: 'Label Example',
        tooltip: 'Tooltip Example',
        tooltipPosition: 'below',
    },
};
