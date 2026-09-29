import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAsideUnsavedDialogMatrixComponent } from './component/test-aside-unsaved-dialog-matrix.component';

/**
 * Окно, которое видит пользователь, закрывая панель с несохранёнными правками. Открывает его
 * общая основа панели, поэтому до этой истории оно попадало в кадр только вместе с той панелью.
 *
 * Своих входов у окна нет — весь текст берётся из набора подписей кита, — поэтому `Playground`
 * у него нет: крутить нечего. Контролов здесь нет намеренно.
 */
export default {
    title: 'Organisms/Aside/AsideUnsavedDialog',
    component: TestRtAsideUnsavedDialogMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtAsideUnsavedDialogMatrixComponent>;

type TStory = StoryObj<TestRtAsideUnsavedDialogMatrixComponent>;

/** Три исхода: отказ от правок, сохранение, остаться. Отказ подан красной рамкой. */
export const Outcomes: TStory = { args: { part: 'outcomes' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
