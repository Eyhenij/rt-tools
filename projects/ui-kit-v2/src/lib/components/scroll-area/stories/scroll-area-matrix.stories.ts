import { Meta, StoryObj } from '@storybook/angular';

import { TestRtScrollAreaMatrixComponent } from './component/test-scroll-area-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Organisms/Layout/ScrollArea',
    component: TestRtScrollAreaMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtScrollAreaMatrixComponent>;

type TStory = StoryObj<TestRtScrollAreaMatrixComponent>;

/** Необъявленная часть не рисуется вовсе — область состоит ровно из того, что передали. */
export const Parts: TStory = { args: { part: 'parts' } };

/** Признак непоказанного снизу: осталось, влезло целиком, вход выключен. */
export const Hint: TStory = { args: { part: 'hint' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
