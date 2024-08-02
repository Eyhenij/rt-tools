import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { HeaderComponent } from './component/header.component';

export default {
    title: 'Components/Header',
    component: HeaderComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
} as Meta<HeaderComponent>;

type Story = StoryObj<HeaderComponent>;

export const Header: Story = {
    args: {
        isMobile: false,
        isTabs: false,
        title: 'Header Title Example',
        content: 'Content example',
    },
};
