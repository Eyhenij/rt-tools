import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtInlineEditMatrixComponent } from './component/test-inline-edit-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно.
 */
export default {
    title: 'Molecules/Forms/InlineEdit',
    component: TestRtInlineEditMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtInlineEditMatrixComponent>;

type TStory = StoryObj<TestRtInlineEditMatrixComponent>;

/** Значение в покое: текстом и плашкой, пустое с подсказкой, длинное в узкой колонке, недоступное. */
export const Look: TStory = { args: { part: 'look' } };

/**
 * Плашка-поле `look="chip-field"`: плашка сама поле, значок слева, кнопок нет. Фокус показан
 * признаком `focus-within` на плашке, длинное значение упирается в предел 24rem.
 */
export const ChipField: TStory = {
    args: { part: 'chip-field' },
    parameters: { pseudo: storyPseudoParameters('.rt-inline-edit__chip-field') },
};

/**
 * Открытое поле: с черновиком, с пустым черновиком — сохранение недоступно, и во время сохранения.
 * Открыто оно входом `editing`, и фокус берёт поле последней ячейки — так же, как при открытии
 * нажатием.
 */
export const Editing: TStory = { args: { part: 'editing' } };

/** Ступени `sm`, `md`, `lg`: высота покоя равна высоте поля, строка не прыгает при открытии. */
export const Size: TStory = { args: { part: 'size' } };

/** Наведение и фокус стилизованы у кнопки значения, а не у хоста: аддон получает спуск до неё. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-inline-edit__value') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
