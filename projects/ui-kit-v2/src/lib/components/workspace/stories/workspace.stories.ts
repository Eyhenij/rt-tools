import { Meta, StoryObj } from '@storybook/angular';

import { TestRtWorkspaceComponent } from './component/test-workspace.component';

export default {
    title: 'Components/Workspace',
    component: TestRtWorkspaceComponent,
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
