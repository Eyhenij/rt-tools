import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

// import { within } from '@storybook/testing-library';
// import { expect } from '@storybook/jest';

import { RtuiRoundIconButtonComponent } from '../icon-round/rtui-round-icon-button.component';

const meta: Meta<RtuiRoundIconButtonComponent> = {
    title: 'Components/RoundIconButton',
    component: RtuiRoundIconButtonComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
};
export default meta;

type Story = StoryObj<RtuiRoundIconButtonComponent>;

export const RoundIconButton: Story = {
    args: {
        icon: 'menu',
    },
};

// export const Heading: Story = {
//     args: {},
//     play: async ({ canvasElement }) => {
//         const canvas = within(canvasElement);
//         expect(canvas.getByText(/rtui-round-icon-button works!/gi)).toBeTruthy();
//     },
// };
