import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { RtuiRoundIconButtonComponent } from '../icon-round/rtui-round-icon-button.component';

export default {
    title: 'Components/RoundIconButton',
    component: RtuiRoundIconButtonComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
} as Meta<RtuiRoundIconButtonComponent>;

type Story = StoryObj<RtuiRoundIconButtonComponent>;

export const RoundIconButton: Story = {
    args: {
        icon: 'menu',
    },
};
