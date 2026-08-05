import { Meta, StoryObj } from '@storybook/angular';

import { TestRtWorkspaceDetailsComponent } from './component/test-workspace-details.component';

export default {
    title: 'Components/WorkspaceDetails',
    component: TestRtWorkspaceDetailsComponent,
    argTypes: {
        title: { control: { type: 'text' } },
        entityId: { control: { type: 'number' } },
        loading: { control: { type: 'boolean' } },
        busy: { control: { type: 'boolean' } },
        rows: { control: false },
        agentEdit: { control: false },
        money: { control: false },
        toggles: { control: false },
        toggleHint: { control: { type: 'text' } },
        transition: { control: false },
        audit: { control: false },
        actions: { control: false },
        error: { control: { type: 'text' } },
    },
} as Meta<TestRtWorkspaceDetailsComponent>;

type Story = StoryObj<TestRtWorkspaceDetailsComponent>;

export const Default: Story = {
    args: {
        title: 'Заголовок',
        entityId: null,
        loading: false,
        busy: false,
        rows: [],
        agentEdit: null,
        money: [],
        toggles: [],
        toggleHint: null,
        transition: null,
        audit: null,
        actions: [],
        error: null,
    },
};
