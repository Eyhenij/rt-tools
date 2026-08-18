import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTimelineMatrixComponent } from './component/test-timeline-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Timeline',
    component: TestRtTimelineMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTimelineMatrixComponent>;

type TStory = StoryObj<TestRtTimelineMatrixComponent>;

export const Status: TStory = { args: { part: 'status' } };

export const Fields: TStory = { args: { part: 'fields' } };

export const Length: TStory = { args: { part: 'length' } };

export const Edges: TStory = { args: { part: 'edges' } };

export const Themes: TStory = { args: { part: 'themes' } };
