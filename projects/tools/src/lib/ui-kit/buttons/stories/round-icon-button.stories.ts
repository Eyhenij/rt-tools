import { MatIconModule } from '@angular/material/icon';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { RtuiRoundIconButtonComponent } from '../icon-round/rtui-round-icon-button.component';

export default {
    title: 'Components/RoundIconButton',
    component: RtuiRoundIconButtonComponent,
    decorators: [
        moduleMetadata({
            imports: [MatIconModule],
        }),
    ],
} as Meta<RtuiRoundIconButtonComponent>;

type Story = StoryObj<RtuiRoundIconButtonComponent>;

export const RoundIconButton: Story = {
    args: {
        icon: 'menu',
    },
};
