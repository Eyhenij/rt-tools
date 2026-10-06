import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDraggableTreeMatrixComponent } from './component/test-draggable-tree-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно.
 */
export default {
    title: 'Organisms/Forms/DraggableTree',
    component: TestRtDraggableTreeMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDraggableTreeMatrixComponent>;

type TStory = StoryObj<TestRtDraggableTreeMatrixComponent>;

/** Плоский список, вложенность с пустой папкой и закреплённым разделом, пустое дерево — SC-UKV-661, SC-UKV-663. */
export const Content: TStory = { args: { part: 'content' } };

/** Разметка приложения вместо подписи — SC-UKV-662. */
export const NodeTemplate: TStory = { args: { part: 'node-template' } };

/**
 * Признак состояния стоит на самом хосте: кольцо фокуса рисует хост, наведение — строка, оно показано
 * на «Финансах».
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: {
        pseudo: {
            hover: "[data-story-state='hover'] .rt-draggable-tree__row[data-value='finance']",
            focusVisible: "[data-story-state='focus-visible']",
        },
    },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
