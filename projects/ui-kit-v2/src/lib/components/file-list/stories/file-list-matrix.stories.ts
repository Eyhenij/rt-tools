import { Meta, StoryObj } from '@storybook/angular';

import { TestRtFileListMatrixComponent } from './component/test-file-list-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Своих входов у столбца нет: ось здесь одна — что в него положили.
 */
export default {
    title: 'Components/FileList',
    component: TestRtFileListMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtFileListMatrixComponent>;

type Story = StoryObj<TestRtFileListMatrixComponent>;

export const Count: Story = { args: { part: 'count' } };

export const Cards: Story = { args: { part: 'cards' } };

/** Пустой столбец стоит рядом с длинным именем: обе крайности видны только вместе. */
export const Edges: Story = { args: { part: 'edges' } };

export const Themes: Story = { args: { part: 'themes' } };
