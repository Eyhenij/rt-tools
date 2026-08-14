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

type Story = StoryObj<TestRtAsideSectionMatrixComponent>;

export const Heading: Story = { args: { part: 'heading' } };

export const Content: Story = { args: { part: 'content' } };

/** Разделы друг под другом: расстояние между ними — то, ради чего компонент заведён. */
export const Stack: Story = { args: { part: 'stack' }, parameters: { snapshot: { fullPage: true } } };

export const Themes: Story = { args: { part: 'themes' } };
