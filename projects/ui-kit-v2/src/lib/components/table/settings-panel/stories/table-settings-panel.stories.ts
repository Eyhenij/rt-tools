import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTableSettingsPanelComponent } from './component/test-table-settings-panel.component';

export default {
    title: 'Components/TableSettingsPanel',
    component: TestRtTableSettingsPanelComponent,
    argTypes: {
        items: { control: false },
    },
} as Meta<TestRtTableSettingsPanelComponent>;

type Story = StoryObj<TestRtTableSettingsPanelComponent>;

export const Default: Story = {
    args: {
        items: [],
    },
};
