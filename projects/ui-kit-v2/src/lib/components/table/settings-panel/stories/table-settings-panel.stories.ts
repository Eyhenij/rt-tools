import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../../showcase';
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
    parameters: storySnapshotSkip(
        'обёртка отдаёт пустой `items`, и панель настроек пуста; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        items: [],
    },
};
