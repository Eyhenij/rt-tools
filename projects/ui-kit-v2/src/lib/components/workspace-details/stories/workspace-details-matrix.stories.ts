import { Meta, StoryObj } from '@storybook/angular';

import { TestRtWorkspaceDetailsMatrixComponent } from './component/test-workspace-details-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/WorkspaceDetails',
    component: TestRtWorkspaceDetailsMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtWorkspaceDetailsMatrixComponent>;

type Story = StoryObj<TestRtWorkspaceDetailsMatrixComponent>;

export const Blocks: Story = { args: { part: 'blocks' } };

/** Вкладки появляются только вместе с переходом или историей — рядом это видно. */
export const Tabs: Story = { args: { part: 'tabs' } };

export const Loading: Story = { args: { part: 'loading' } };

export const Actions: Story = { args: { part: 'actions' } };

export const Audit: Story = { args: { part: 'audit' } };

export const Themes: Story = { args: { part: 'themes' } };
