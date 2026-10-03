import { Meta, StoryObj } from '@storybook/angular';

import { TestRtSpinnerMatrixComponent } from './component/test-spinner-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Feedback/Spinner',
    component: TestRtSpinnerMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSpinnerMatrixComponent>;

type TStory = StoryObj<TestRtSpinnerMatrixComponent>;

export const Color: TStory = { args: { part: 'color' } };

export const Diameter: TStory = { args: { part: 'diameter' } };

/** Вид кольца: с дорожкой и дугой без дорожки, как в Material, — в каждой палитре. */
export const Appearance: TStory = { args: { part: 'appearance' } };

/** Плашка под кольцом: её размер идёт за диаметром. */
export const Plate: TStory = { args: { part: 'plate' } };

/** Спиннер поверх блока: без подложки, с подложкой, с плашкой и дугой. */
export const Overlay: TStory = { args: { part: 'overlay' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
