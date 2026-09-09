import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtSplitButtonMatrixComponent } from './component/test-split-button-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Forms/SplitButton',
    component: TestRtSplitButtonMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSplitButtonMatrixComponent>;

type TStory = StoryObj<TestRtSplitButtonMatrixComponent>;

export const Theme: TStory = { args: { part: 'theme' } };

export const Size: TStory = { args: { part: 'size' } };

/**
 * Стилизованы обе кнопки внутри хоста, а признак стоит на хосте — аддону передан спуск до них:
 * без него класс лёг бы на элемент, у которого этих правил нет. Наведение показано сразу на
 * обеих половинах: они красятся заодно, хотя нажимаются порознь.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('button') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };

/**
 * Раскрытое меню второстепенных действий. Открывает его `play`-функция, нажимая **каретку**:
 * основная кнопка меню не открывает — это два независимых действия, и щелчок по ней просто
 * поднял бы `faceClick`.
 */
export const Panel: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'panel' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { within: '.rt-split-button__toggle' });
    },
};
