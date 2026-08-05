import { Meta, StoryObj } from '@storybook/angular';

import { TestRtSectionNavComponent } from './component/test-section-nav.component';

export default {
    title: 'Components/SectionNav',
    component: TestRtSectionNavComponent,
    argTypes: {
        items: { control: false },
    },
} as Meta<TestRtSectionNavComponent>;

type Story = StoryObj<TestRtSectionNavComponent>;

export const Default: Story = {
    args: {
        items: [],
    },
};
