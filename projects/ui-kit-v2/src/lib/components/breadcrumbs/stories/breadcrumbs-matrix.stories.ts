import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtBreadcrumbsMatrixComponent } from './component/test-breadcrumbs-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно.
 */
export default {
    title: 'Molecules/Navigation/Breadcrumbs',
    component: TestRtBreadcrumbsMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtBreadcrumbsMatrixComponent>;

type TStory = StoryObj<TestRtBreadcrumbsMatrixComponent>;

export const Chain: TStory = { args: { part: 'chain' } };

export const Look: TStory = { args: { part: 'look' } };

export const Fold: TStory = { args: { part: 'fold' } };

export const Width: TStory = { args: { part: 'width' } };

/** Наведение и фокус стилизованы у ссылки звена, а не у хоста: аддон получает спуск до неё. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-breadcrumbs__link') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
