import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost, storyWidthOver } from '../../../../showcase';
import { TestRtWorkspaceComponent } from './component/test-workspace.component';

export default {
    title: 'Components/Workspace',
    component: TestRtWorkspaceComponent,
    // Показ рисует не сетка витрины, поэтому кадр целой страницей. Рабочее место называет ширину
    // тремя правилами: два включающих порога и одно строгое `width > 1080px` — у него кадр берётся
    // на пиксель шире, иначе проверялась бы сторона, где правило не действует.
    parameters: { snapshot: { fullPage: true, widths: [storyWidthAtMost(1080), storyWidthAtMost(768), storyWidthOver(1080)] } },
    argTypes: {
        storageKey: { control: { type: 'text' } },
        hasActive: { control: { type: 'boolean' } },
        listMinWidth: { control: { type: 'number' } },
        listMaxWidth: { control: { type: 'number' } },
        listDefaultWidth: { control: { type: 'number' } },
        asideMinWidth: { control: { type: 'number' } },
        asideMaxWidth: { control: { type: 'number' } },
        asideDefaultWidth: { control: { type: 'number' } },
        centerMinWidth: { control: { type: 'number' } },
    },
} as Meta<TestRtWorkspaceComponent>;

type Story = StoryObj<TestRtWorkspaceComponent>;

export const Default: Story = {
    args: {
        storageKey: null,
        hasActive: false,
        listMinWidth: 240,
        listMaxWidth: 480,
        listDefaultWidth: 320,
        asideMinWidth: 280,
        asideMaxWidth: 560,
        asideDefaultWidth: 360,
        centerMinWidth: 360,
    },
};
