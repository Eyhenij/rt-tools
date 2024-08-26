import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { RtuiToggleComponent } from '../rtui-toggle.component';

export default {
    title: 'Components/Toggle',
    component: RtuiToggleComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
} as Meta<RtuiToggleComponent>;

type Story = StoryObj<RtuiToggleComponent>;

export const Toggle: Story = {
    args: {
        disabled: false,
        tooltipDisabled: false,
        size: 'md',
        label: 'Label Example',
        tooltip: 'Tooltip Example',
        tooltipPosition: 'below',
    },
};
