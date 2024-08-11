import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { TestHeaderComponent } from './component/test-header.component';

export default {
    title: 'Components/Header',
    component: TestHeaderComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
} as Meta<TestHeaderComponent>;

type Story = StoryObj<TestHeaderComponent>;

export const Header: Story = {
    args: {
        isMobile: false,
        isTabs: false,
        title: 'Header Title Example',
        content: 'Content example',
    },
};
