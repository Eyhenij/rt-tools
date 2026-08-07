import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtMenuMatrixComponent } from './component/test-menu-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Menu',
    component: TestRtMenuMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMenuMatrixComponent>;

type Story = StoryObj<TestRtMenuMatrixComponent>;

/** Закрытое меню: иконка триггера и недоступность. */
export const Trigger: Story = { args: { part: 'trigger' } };

/**
 * Триггер рисует `rt-icon-button`, а признак стоит на хосте меню — аддону передан спуск до
 * кнопки: без него класс лёг бы на элемент, у которого этих правил нет.
 */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('button') },
};

export const Themes: Story = { args: { part: 'themes' } };

/**
 * Раскрытое меню, прижатое к правому краю триггера (умолчание). Открывает его `play`-функция.
 * Виды пунктов показаны набором внутри одной панели: второе меню открыть некуда — жест по его
 * триггеру достался бы backdrop'у первого.
 */
export const PanelAlignEnd: Story = {
    args: { part: 'panel', align: 'end' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement);
    },
};

/** То же меню, прижатое к левому краю триггера. */
export const PanelAlignStart: Story = {
    args: { part: 'panel', align: 'start' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement);
    },
};
