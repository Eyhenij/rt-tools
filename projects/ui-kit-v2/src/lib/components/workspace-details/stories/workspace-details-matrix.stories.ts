import { Meta, StoryObj } from '@storybook/angular';

import { TestRtWorkspaceDetailsMatrixComponent } from './component/test-workspace-details-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Workspace/WorkspaceDetails',
    component: TestRtWorkspaceDetailsMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtWorkspaceDetailsMatrixComponent>;

type TStory = StoryObj<TestRtWorkspaceDetailsMatrixComponent>;

export const Blocks: TStory = { args: { part: 'blocks' } };

/** Вкладки появляются только вместе с переходом или историей — рядом это видно. */
export const Tabs: TStory = { args: { part: 'tabs' } };

export const Loading: TStory = { args: { part: 'loading' } };

export const Actions: TStory = { args: { part: 'actions' } };

export const Audit: TStory = { args: { part: 'audit' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
