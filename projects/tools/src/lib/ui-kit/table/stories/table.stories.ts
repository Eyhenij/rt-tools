import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import TestTableComponent from './component/test-table-component';

export default {
    title: 'Components/Table',
    component: TestTableComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
} as Meta<TestTableComponent>;

type Story = StoryObj<TestTableComponent>;

export const Table: Story = {
    args: {
        isMobile: false,
    },
};
