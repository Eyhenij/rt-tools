import { Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { TestRtAutocompleteComponent } from './component/test-autocomplete.component';

export default {
    title: 'Components/Autocomplete',
    component: TestRtAutocompleteComponent,
    argTypes: {
        placeholder: { control: { type: 'text' } },
        minLength: { control: { type: 'number' } },
        openOnFocus: { control: { type: 'boolean' } },
        suggestions: { control: false },
        displayWith: { control: false },
        iconLeft: { control: false },
    },
} as Meta<TestRtAutocompleteComponent>;

type Story = StoryObj<TestRtAutocompleteComponent>;

export const Playground: Story = {
    args: {
        placeholder: 'Начните вводить город',
        minLength: 1,
        openOnFocus: false,
    },
};

/**
 * Подсказки запрашиваются уже при фокусе — для списков «последнее выбранное».
 *
 * Фокус ставит `play`: без него история рисовала обычное пустое поле, то есть
 * ровно то же, что `Playground`, — режим объявлен входом и ничем не показан.
 * Жест уходит полю внутри обёртки: раскрытие слушает `<input>`, а не хост.
 */
export const OpenOnFocus: Story = {
    args: {
        ...Playground.args,
        openOnFocus: true,
    },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { within: 'input', wait: 200 });
    },
};
