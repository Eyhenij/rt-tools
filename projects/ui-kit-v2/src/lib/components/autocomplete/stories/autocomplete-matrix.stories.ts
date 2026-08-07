import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtAutocompleteMatrixComponent } from './component/test-autocomplete-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Autocomplete',
    component: TestRtAutocompleteMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtAutocompleteMatrixComponent>;

type Story = StoryObj<TestRtAutocompleteMatrixComponent>;

export const Size: Story = { args: { part: 'size' } };

export const Filling: Story = { args: { part: 'filling' } };

export const Bordered: Story = { args: { part: 'bordered' } };

/**
 * Рамку рисует коробка вокруг `<input>`, а признак стоит на хосте — аддону передан спуск до неё:
 * без него класс лёг бы на элемент, у которого этих правил нет.
 */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-autocomplete__field') },
};

export const Themes: Story = { args: { part: 'themes' } };

/**
 * Раскрытые подсказки. Открывает их `play`-функция набором текста, а не щелчком: поле с
 * подсказками раскрывается вводом — оно считает длину строки и только потом просит подсказки.
 *
 * Панель рисуется в контейнере оверлеев CDK — за пределами блока истории. Поэтому её нет ни в
 * светло-тёмной паре, ни в матрице состояний: тёмную панель смотрят переключателем темы.
 */
export const Panel: Story = {
    args: { part: 'panel', panel: 'suggestions' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { text: 'Мо', within: 'input' });
    },
};

/** Своя разметка подсказки: вход `itemTemplate` рисует иконку рядом с названием. */
export const PanelWithTemplate: Story = {
    args: { part: 'panel', panel: 'template' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { text: 'Мо', within: 'input' });
    },
};

/** Подсказок не нашлось: строка `rtKit.uiNothingFound` вместо списка. */
export const PanelEmpty: Story = {
    args: { part: 'panel', panel: 'empty' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { text: 'Мо', within: 'input' });
    },
};
