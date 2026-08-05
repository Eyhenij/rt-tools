import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAsideSectionComponent } from './component/test-aside-section.component';

export default {
    title: 'Components/AsideSection',
    component: TestRtAsideSectionComponent,
    argTypes: {
        heading: { control: { type: 'text' } },
    },
} as Meta<TestRtAsideSectionComponent>;

type Story = StoryObj<TestRtAsideSectionComponent>;

export const Default: Story = {
    args: {
        heading: 'Заголовок',
    },
};
