import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtSectionNavMatrixComponent } from './component/test-section-nav-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Navigation/SectionNav',
    component: TestRtSectionNavMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSectionNavMatrixComponent>;

type TStory = StoryObj<TestRtSectionNavMatrixComponent>;

export const Active: TStory = { args: { part: 'active' } };

export const Length: TStory = { args: { part: 'length' } };

/**
 * Наведение и фокус стилизованы у самой плитки, а не у хоста навигации, — аддон псевдосостояний
 * получает спуск до неё. Без спуска признак встал бы на контейнер, и ни одно правило не сработало.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-section-nav__tile') },
};

export const Edges: TStory = { args: { part: 'edges' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
