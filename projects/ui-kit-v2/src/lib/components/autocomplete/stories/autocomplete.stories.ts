import { Meta, StoryObj } from '@storybook/angular';

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

/** Подсказки запрашиваются уже при фокусе — для списков «последнее выбранное». */
export const OpenOnFocus: Story = {
    args: {
        ...Playground.args,
        openOnFocus: true,
    },
};
