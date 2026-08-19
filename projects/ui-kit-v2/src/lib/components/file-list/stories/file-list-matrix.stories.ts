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
    title: 'Molecules/Files/FileList',
    component: TestRtFileListMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtFileListMatrixComponent>;

type TStory = StoryObj<TestRtFileListMatrixComponent>;

export const Count: TStory = { args: { part: 'count' } };

export const Cards: TStory = { args: { part: 'cards' } };

/** Пустой столбец стоит рядом с длинным именем: обе крайности видны только вместе. */
export const Edges: TStory = { args: { part: 'edges' } };

export const Themes: TStory = { args: { part: 'themes' } };
