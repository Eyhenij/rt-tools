import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { TestRtActionBarMatrixComponent } from './component/test-action-bar-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу. Контролов здесь нет
 * намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 *
 * Матрицы целятся в саму полосу, а не в держатель: держатель приколот к окну и своего вида не
 * имеет — он решает, стоит ли полоса в разметке. Его показ стоит отдельной историей.
 */
export default {
    title: 'Molecules/Data/ActionBar',
    component: TestRtActionBarMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtActionBarMatrixComponent>;

type TStory = StoryObj<TestRtActionBarMatrixComponent>;

export const Counter: TStory = { args: { part: 'counter' } };

export const Actions: TStory = { args: { part: 'actions' } };

/** Ряд действий, не влезший в место: полоса обещает перенос, и виден он только здесь. */
export const Wrap: TStory = { args: { part: 'wrap' } };

/** Цвета, отступы, кегль и начертания — свойствами с тега полосы, SC-UKV-576. */
export const Properties: TStory = { args: { part: 'properties' } };

/**
 * Меню действия со списком открыто: оно живёт в оверлее, вне полосы, и скругление с тенью у него
 * свои — SC-UKV-577. История нажимает кнопку первого действия и называет панель меню.
 */
export const Menu: TStory = {
    parameters: { snapshot: { fullPage: true, overlay: '.rt-action-bar__menu' } },
    args: { part: 'menu' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { within: '.rt-action-bar__action' });
    },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
