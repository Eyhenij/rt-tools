import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { fn } from '@storybook/test';

import { TestButtonComponent } from './test-button-component/test-button.component';

export default {
    title: 'Components/Button',
    component: TestButtonComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
    argTypes: {},
    args: { onClick: fn() },
} as Meta<TestButtonComponent>;

type Story = StoryObj<TestButtonComponent>;

export const Button: Story = {
    args: {},
};
