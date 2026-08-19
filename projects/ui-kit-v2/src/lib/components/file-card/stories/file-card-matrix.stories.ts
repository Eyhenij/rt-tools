import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtFileCardMatrixComponent } from './component/test-file-card-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Files/FileCard',
    component: TestRtFileCardMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtFileCardMatrixComponent>;

type TStory = StoryObj<TestRtFileCardMatrixComponent>;

export const Size: TStory = { args: { part: 'size' } };

export const Actions: TStory = { args: { part: 'actions' } };

export const Name: TStory = { args: { part: 'name' } };

export const Weight: TStory = { args: { part: 'weight' } };

/** Наведение и фокус стилизованы у самой карточки — аддон псевдосостояний получает спуск до неё. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-file-card') },
};

export const Disabled: TStory = { args: { part: 'disabled' } };

export const Themes: TStory = { args: { part: 'themes' } };
