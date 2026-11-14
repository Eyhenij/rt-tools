import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { TestRtAutocompleteStatesComponent } from './component/test-autocomplete-states.component';

/** Ошибка загрузки и свои шаблоны по одобренному кадру. Контролов нет: случай выбирает история. */
export default {
    title: 'Molecules/Forms/Autocomplete',
    component: TestRtAutocompleteStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtAutocompleteStatesComponent>;

type TStory = StoryObj<TestRtAutocompleteStatesComponent>;

/** Панель открывается вводом: поле считает длину строки и только потом показывает панель. */
async function openPanel({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await openStoryOverlay(canvasElement, { text: 'Мо', within: 'input' });
}

/** Ошибка загрузки: компактная заглушка панели со значком, строкой и кнопкой «Повторить». */
export const PanelError: TStory = { parameters: { snapshot: { fullPage: true } }, args: { state: 'error' }, play: openPanel };

/** Свой шаблон ошибки `rtAutocompleteError` вместо заглушки. */
export const PanelOwnError: TStory = { parameters: { snapshot: { fullPage: true } }, args: { state: 'own-error' }, play: openPanel };

/** Свой шаблон пустого `rtAutocompleteEmpty` вместо строки «Ничего не найдено». */
export const PanelOwnEmpty: TStory = { parameters: { snapshot: { fullPage: true } }, args: { state: 'own-empty' }, play: openPanel };
