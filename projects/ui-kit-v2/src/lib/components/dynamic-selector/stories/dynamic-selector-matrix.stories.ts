import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDynamicSelectorMatrixComponent } from './component/test-dynamic-selector-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов нет
 * намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре неотличимо
 * от отсутствующего.
 *
 * Наведение, фокус и нажатие рисуют кнопки строки и полосы — `rt-icon-button` и `[rtButton]`; их
 * состояния показаны в их собственных семьях, и своих у списка нет.
 */
export default {
    title: 'Organisms/Forms/DynamicSelector',
    component: TestRtDynamicSelectorMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDynamicSelectorMatrixComponent>;

type TStory = StoryObj<TestRtDynamicSelectorMatrixComponent>;

export const Rows: TStory = { args: { part: 'rows' } };

/** Кнопки-иконки списка круглые по умолчанию; шаг задаёт вход `buttonRadius`. */
export const ButtonRadius: TStory = { args: { part: 'radius' } };

/** Свои кнопки строки и своё название — шаблоны вызывающего; корзина остаётся китовой. */
export const RowTemplates: TStory = { args: { part: 'templates' } };

export const Invitation: TStory = { args: { part: 'invitation' } };

export const States: TStory = { args: { part: 'states' } };

/** Окно выбора стоит в разметке: в оверлее открытое окно было бы одно, а случаев шесть. */
export const Popup: TStory = { args: { part: 'popup' } };

/** Поле строк — те же строки и полоса, но строки набирают вручную. */
export const StringList: TStory = { args: { part: 'input' } };

/** Переключатели списка: корзина, панель сброса и очистки, правки в шаблоне строки. */
export const Switches: TStory = { args: { part: 'switches' } };

/** Окно с начальным запросом: текст уже в поиске, предложены только совпадения. */
export const InitialQuery: TStory = { args: { part: 'initial-query' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
