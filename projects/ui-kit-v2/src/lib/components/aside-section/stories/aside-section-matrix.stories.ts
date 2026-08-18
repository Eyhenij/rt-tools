import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAsideSectionMatrixComponent } from './component/test-aside-section-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/AsideSection',
    component: TestRtAsideSectionMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtAsideSectionMatrixComponent>;

type TStory = StoryObj<TestRtAsideSectionMatrixComponent>;

export const Heading: TStory = { args: { part: 'heading' } };

export const Content: TStory = { args: { part: 'content' } };

/** Разделы друг под другом: расстояние между ними — то, ради чего компонент заведён. */
export const Stack: TStory = { args: { part: 'stack' }, parameters: { snapshot: { fullPage: true } } };

export const Themes: TStory = { args: { part: 'themes' } };
