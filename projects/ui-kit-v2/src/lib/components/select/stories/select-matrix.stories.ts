import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtSelectMatrixComponent } from './component/test-select-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Select',
    component: TestRtSelectMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSelectMatrixComponent>;

type Story = StoryObj<TestRtSelectMatrixComponent>;

export const Size: Story = { args: { part: 'size' } };

export const Filling: Story = { args: { part: 'filling' } };

export const Bordered: Story = { args: { part: 'bordered' } };

/**
 * Рамку и кольцо рисует `<button>` внутри хоста, а признак стоит на хосте — аддону передан
 * спуск до него: без него класс лёг бы на элемент, у которого этих правил нет.
 */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-select__trigger') },
};

export const Themes: Story = { args: { part: 'themes' } };

/**
 * Раскрытый список. Открывает его `play`-функция клавишей, а не щелчком: клавиша заодно
 * подсвечивает первую опцию, и состояние `--active` иначе в витрине не увидеть.
 *
 * Панель рисуется в контейнере оверлеев CDK — за пределами блока истории. Поэтому её нет
 * ни в светло-тёмной паре, ни в матрице состояний: тёмную панель смотрят переключателем
 * темы в тулбаре.
 */
export const Panel: Story = {
    args: { part: 'panel', panel: 'options' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};

/** Тот же список со строкой фильтра: она занимает первую строку панели и сужает набор. */
export const PanelWithFilter: Story = {
    args: { part: 'panel', panel: 'filter' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};

/** Пустой набор опций: строка `rtKit.uiNoOptions` вместо списка. */
export const PanelEmpty: Story = {
    args: { part: 'panel', panel: 'empty' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};
