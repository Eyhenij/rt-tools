import { Meta, StoryObj } from '@storybook/angular';

import { TestRtFileInputMatrixComponent } from './component/test-file-input-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Историй наведения и фокуса нет: своих состояний взаимодействия у поля не бывает — они
 * принадлежат кнопке выбора и карточкам файлов и показаны в их матрицах.
 */
export default {
    title: 'Molecules/Forms/FileInput',
    component: TestRtFileInputMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtFileInputMatrixComponent>;

type TStory = StoryObj<TestRtFileInputMatrixComponent>;

export const Filling: TStory = { args: { part: 'filling' } };

export const Button: TStory = { args: { part: 'button' } };

export const States: TStory = { args: { part: 'states' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
