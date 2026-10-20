import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtColorPaletteMatrixComponent } from './component/test-color-palette-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Forms/ColorPalette',
    component: TestRtColorPaletteMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtColorPaletteMatrixComponent>;

type TStory = StoryObj<TestRtColorPaletteMatrixComponent>;

export const Value: TStory = { args: { part: 'value' } };

export const Colors: TStory = { args: { part: 'colors' } };

export const Readonly: TStory = { args: { part: 'readonly' } };

/** Признак стоит на хосте, а наведение и кольцо фокуса рисует образец — аддону передан спуск до него. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-color-palette__swatch') },
};

export const Picker: TStory = { args: { part: 'picker' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
