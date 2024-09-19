import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { fn } from '@storybook/test';

import { OpenAsideButtonComponent } from './open-aside-button.component';

const meta: Meta<OpenAsideButtonComponent> = {
    title: 'Components/Aside',
    component: OpenAsideButtonComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
    argTypes: {},
    args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<OpenAsideButtonComponent>;

export const Aside: Story = {
    args: {},
};
