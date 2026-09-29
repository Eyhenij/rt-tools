import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMenuConfirmDialogMatrixComponent } from './component/test-menu-confirm-dialog-matrix.component';

/**
 * Окно подтверждения деструктивного пункта меню. Открывает его сам пункт, наружу компонент не
 * экспортируется, и до этой истории он попадал в кадр только вместе с меню.
 *
 * Данные окно берёт из инжектора, а не из входов, поэтому `Playground` у него нет: крутить
 * нечего. Контролов здесь нет намеренно.
 */
export default {
    title: 'Molecules/Navigation/MenuConfirmDialog',
    component: TestRtMenuConfirmDialogMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMenuConfirmDialogMatrixComponent>;

type TStory = StoryObj<TestRtMenuConfirmDialogMatrixComponent>;

/** Тон подтверждающей кнопки: опасное действие, предупреждение, обычное подтверждение. */
export const Tone: TStory = { args: { part: 'tone' } };

/** Заголовок и длина сообщения: с заголовком, без него, длинное сообщение. */
export const Heading: TStory = { args: { part: 'heading' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
