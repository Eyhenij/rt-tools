import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { STORY_PSEUDO_PARAMETERS } from '../../../../showcase/story-states';
import { TestRtFieldExtrasComponent } from './component/test-field-extras.component';

/**
 * Дополнения поля ввода и выбора: подпись на рамке, своя строка списка, иконки-кнопки поля и
 * крестик в порядке обхода. Все входы необязательные — поле без них рисуется как на страницах
 * `Input` и `Select`.
 *
 * Страницы с входами нет: строка списка приезжает проекцией шаблона, а витрина подставляет
 * значения, а не разметку.
 */
export default {
    title: 'Molecules/Forms/FieldExtras',
    component: TestRtFieldExtrasComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtFieldExtrasComponent>;

type TStory = StoryObj<TestRtFieldExtrasComponent>;

/** Подпись лежит на месте подсказки у пустого поля и поднимается на рамку при значении и фокусе. */
export const FloatingLabel: TStory = {
    args: { part: 'label' },
    parameters: { pseudo: STORY_PSEUDO_PARAMETERS },
};

/** Плотная панель: поля с подписью на рамке той же высоты, что поле без неё. */
export const FloatingLabelToolbar: TStory = { args: { part: 'label-toolbar' } };

export const Themes: TStory = { args: { part: 'label-themes' } };

/** Своя строка списка: цветная метка перед подписью, галочка выбранного остаётся у кита. */
export const OptionTemplate: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'option' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};

/** Левая иконка — кнопка с подсказкой и фокусом с клавиши; правая осталась картинкой. */
export const IconActions: TStory = {
    args: { part: 'icon-actions' },
    parameters: { pseudo: STORY_PSEUDO_PARAMETERS },
};

/** Крестик в порядке обхода — по `clearTabbable`; рядом поле как прежде. */
export const ClearTabbable: TStory = { args: { part: 'clear' } };
