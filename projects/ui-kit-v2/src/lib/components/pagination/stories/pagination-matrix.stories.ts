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
    title: 'Molecules/Navigation/Pagination',
    component: TestRtPaginationMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtPaginationMatrixComponent>;

type TStory = StoryObj<TestRtPaginationMatrixComponent>;

export const Position: TStory = { args: { part: 'position' } };

export const Total: TStory = { args: { part: 'total' } };

export const Loading: TStory = { args: { part: 'loading' } };

export const Container: TStory = { args: { part: 'container' } };

export const Edges: TStory = { args: { part: 'edges' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
