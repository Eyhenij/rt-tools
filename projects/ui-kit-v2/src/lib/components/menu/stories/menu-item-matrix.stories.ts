import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtMenuItemMatrixComponent } from './component/test-menu-item-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/MenuItem',
    component: TestRtMenuItemMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMenuItemMatrixComponent>;

type TStory = StoryObj<TestRtMenuItemMatrixComponent>;

/** Виды пункта: с иконкой и без, деструктивный, недоступный, с подтверждением. */
export const Kinds: TStory = { args: { part: 'kinds' } };

/**
 * Стилизован сам хост пункта, поэтому спуск аддону не нужен: признак и правила стоят на одном
 * элементе. Второй ряд показывает, что у недоступного пункта наведение намеренно ничего не
 * красит.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters() },
};

export const Themes: TStory = { args: { part: 'themes' } };
