import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDownloadLinkComponent } from './component/test-download-link.component';

export default {
    title: 'Components/DownloadLink',
    component: TestRtDownloadLinkComponent,
    argTypes: {
        label: { control: { type: 'text' } },
    },
} as Meta<TestRtDownloadLinkComponent>;

type Story = StoryObj<TestRtDownloadLinkComponent>;

export const Default: Story = {
    args: {
        label: 'Сохранить',
    },
};
