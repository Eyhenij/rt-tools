import { Meta, StoryObj } from '@storybook/angular';

import { TestRtBottomSheetMatrixComponent } from './component/test-bottom-sheet-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Aside/BottomSheet',
    component: TestRtBottomSheetMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtBottomSheetMatrixComponent>;

type TStory = StoryObj<TestRtBottomSheetMatrixComponent>;

export const Open: TStory = { args: { part: 'open' } };

export const Content: TStory = { args: { part: 'content' } };

export const Themes: TStory = { args: { part: 'themes' } };
