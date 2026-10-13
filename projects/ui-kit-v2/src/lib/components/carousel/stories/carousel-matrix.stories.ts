import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtCarouselMatrixComponent } from './component/test-carousel-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Carousel',
    component: TestRtCarouselMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtCarouselMatrixComponent>;

type TStory = StoryObj<TestRtCarouselMatrixComponent>;

export const Cards: TStory = { args: { part: 'cards' } };

export const Colors: TStory = { args: { part: 'colors' } };

/** Признак стоит на хосте, а открывается вторая карточка — аддону передан спуск до неё. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-carousel__card:nth-of-type(2)') },
};

/**
 * Стопка размера приложения: двенадцать прав с подписями до сорока знаков, аббревиатурами и
 * карточками без цвета. Открывается третья карточка — самая длинная подпись.
 */
export const Permissions: TStory = {
    args: { part: 'permissions' },
    parameters: { pseudo: storyPseudoParameters('.rt-carousel__card:nth-of-type(3)') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
