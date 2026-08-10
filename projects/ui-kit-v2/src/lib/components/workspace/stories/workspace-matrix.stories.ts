import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { TestRtWorkspaceMatrixComponent } from './component/test-workspace-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Рабочий стол объявляет два своих порога — 1080 px и 768 px, — и на узком появляется полоса с
 * кнопками «назад» и «подробности». Её включает медиазапрос, а не вход, поэтому увидеть её
 * можно только на кадре порога.
 */
export default {
    title: 'Components/Workspace',
    component: TestRtWorkspaceMatrixComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { widths: [storyWidthAtMost(1080), storyWidthAtMost(768)] },
    },
} as Meta<TestRtWorkspaceMatrixComponent>;

type Story = StoryObj<TestRtWorkspaceMatrixComponent>;

export const Slots: Story = { args: { part: 'slots' } };

export const Active: Story = { args: { part: 'active' } };

export const Widths: Story = { args: { part: 'widths' } };

export const Themes: Story = { args: { part: 'themes' } };
