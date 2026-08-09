import { Meta, StoryObj } from '@storybook/angular';

import { TestRtPaginationMatrixComponent } from './component/test-pagination-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Свою ширину компонент не объявляет: формы переключает запрос по ширине контейнера, а не
 * окна, и порогом кадра это не проверяется. Обе формы стоят рядом в истории `Container`.
 */
export default {
    title: 'Components/Pagination',
    component: TestRtPaginationMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtPaginationMatrixComponent>;

type Story = StoryObj<TestRtPaginationMatrixComponent>;

export const Position: Story = { args: { part: 'position' } };

export const Total: Story = { args: { part: 'total' } };

export const Loading: Story = { args: { part: 'loading' } };

export const Container: Story = { args: { part: 'container' } };

export const Edges: Story = { args: { part: 'edges' } };

export const Themes: Story = { args: { part: 'themes' } };
