import { Meta, StoryObj } from '@storybook/angular';

import { TestRtRichEditorMatrixComponent } from './component/test-rich-editor-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Наведение и фокус отдельными историями не показываются: поверхность ввода принадлежит Quill,
 * и её состояния приходят из его темы, а не из SCSS кита.
 */
export default {
    title: 'Organisms/Chat/RichEditor',
    component: TestRtRichEditorMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtRichEditorMatrixComponent>;

type TStory = StoryObj<TestRtRichEditorMatrixComponent>;

export const Toolbar: TStory = { args: { part: 'toolbar' } };

export const Filling: TStory = { args: { part: 'filling' } };

export const States: TStory = { args: { part: 'states' } };

export const Themes: TStory = { args: { part: 'themes' } };
