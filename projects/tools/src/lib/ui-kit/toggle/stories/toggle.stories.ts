import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { TOGGLE_SIZE_TYPE_ENUM } from '../toggle-size.type.enum';
import { TestToggleComponent } from './component/test-toggle.component';

export default {
    title: 'Components/Toggle',
    component: TestToggleComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
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
