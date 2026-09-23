import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTableSettingsPanelComponent } from './component/test-table-settings-panel.component';

export default {
    title: 'Organisms/Table/TableSettingsPanel',
    component: TestRtTableSettingsPanelComponent,
    // Панель рисует себя сама, а не сеткой показа из `src/showcase`: корня показа на странице
    // нет, и кадр берётся целой страницей.
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        items: { control: false },
    },
} as Meta<TestRtTableSettingsPanelComponent>;

type TStory = StoryObj<TestRtTableSettingsPanelComponent>;

/** Закреплённая колонка, обычные и скрытая — все четыре случая строки панели сразу. */
export const Playground: TStory = {};
