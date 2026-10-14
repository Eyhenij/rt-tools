import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtProgressBarMatrixComponent } from './component/test-progress-bar-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно: значение, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Feedback/ProgressBar',
    component: TestRtProgressBarMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtProgressBarMatrixComponent>;

type TStory = StoryObj<TestRtProgressBarMatrixComponent>;

export const Value: TStory = { args: { part: 'value' } };

/** Режим без доли — бегущий отрезок; кадр снимает одно его положение, и снимок не ставится. */
export const Mode: TStory = {
    args: { part: 'mode' },
    parameters: storySnapshotSkip('бегущий отрезок не стоит на месте: два снимка подряд не совпадут'),
};

export const Color: TStory = { args: { part: 'color' } };

/** Живая доля: «Запустить заново» гонит полосу тиками до ста. */
export const Live: TStory = { args: { part: 'live' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
