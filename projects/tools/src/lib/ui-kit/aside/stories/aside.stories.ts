import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { fn } from '@storybook/test';

import { OpenAsideButtonComponent } from './open-aside-button.component';

const meta: Meta<OpenAsideButtonComponent> = {
    title: 'Components/Aside',
    component: OpenAsideButtonComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
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
