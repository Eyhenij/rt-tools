import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtMenuItemMatrixComponent } from './component/test-menu-item-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Navigation/MenuItem',
    component: TestRtMenuItemMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMenuItemMatrixComponent>;

type TStory = StoryObj<TestRtMenuItemMatrixComponent>;

/** Виды пункта: с иконкой и без, деструктивный, недоступный, с подтверждением. */
export const Kinds: TStory = { args: { part: 'kinds' } };

/**
 * Фокус пункта-ссылки стоит на ссылке внутри, а сам хост фокуса не получает: признак фокуса у
 * такого пункта спускается до ссылки и хост не красит.
 */
const LINK_PSEUDO_PARAMETERS: Readonly<Record<string, string | readonly string[]>> = {
    ...storyPseudoParameters(),
    focusVisible: [
        "[data-story-state='focus-visible']:not(.rt-menu-item--link)",
        storyPseudoParameters('.rt-menu-item__link')['focusVisible'],
    ],
};

/**
 * Стилизован сам хост пункта, поэтому спуск аддону не нужен: признак и правила стоят на одном
 * элементе. Второй ряд показывает, что у недоступного пункта наведение намеренно ничего не
 * красит. Третий — пункт-ссылка: наведение красит хост, а фокус — ссылку внутри.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: LINK_PSEUDO_PARAMETERS },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
