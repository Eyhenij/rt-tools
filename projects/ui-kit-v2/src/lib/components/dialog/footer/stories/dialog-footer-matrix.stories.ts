import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDialogFooterMatrixComponent } from './component/test-dialog-footer-matrix.component';

/**
 * Футер окна своих входов не имеет: он слот композиции, и показывать его можно только разметкой
 * с проекцией содержимого. Поэтому `Playground` у него нет — крутить нечего, — а матрица
 * перебирает наборы проецируемого содержимого.
 *
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем, при беглом
 * просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Dialog/DialogFooter',
    component: TestRtDialogFooterMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDialogFooterMatrixComponent>;

type TStory = StoryObj<TestRtDialogFooterMatrixComponent>;

/** Содержимое футера: одна кнопка, пара, пара со статусной строкой, пустой футер. */
export const Content: TStory = { args: { part: 'content' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
