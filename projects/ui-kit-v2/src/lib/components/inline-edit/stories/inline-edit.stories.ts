import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtInlineEditComponent } from './component/test-inline-edit.component';

const RADIO: { readonly control: { readonly type: 'inline-radio' } } = { control: { type: 'inline-radio' } };

export default {
    title: 'Molecules/Forms/InlineEdit',
    component: TestRtInlineEditComponent,
    argTypes: {
        value: { control: { type: 'text' } },
        placeholder: { control: { type: 'text' } },
        look: { ...RADIO, options: ['text', 'chip', 'chip-field'] },
        size: { ...RADIO, options: ['sm', 'md', 'lg'] },
        blurAction: { ...RADIO, options: ['keep', 'save', 'cancel'] },
        allowEmpty: { control: { type: 'boolean' } },
        slowSave: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtInlineEditComponent>;

type TStory = StoryObj<TestRtInlineEditComponent>;

/**
 * Живая правка: сохранённое значение встаёт на место. С «медленным сохранением» поле ждёт секунду,
 * как приложение, которое отвечает позже: кнопка крутится, поле недоступно.
 */
export const Playground: TStory = {
    parameters: storySnapshotSkip('значение в покое и открытое поле уже стоят ячейками в матрицах этого компонента'),
    args: {
        value: 'Отчёт по продажам за май',
        placeholder: 'Название отчёта',
        look: 'text',
        size: 'sm',
        blurAction: 'keep',
        allowEmpty: false,
        slowSave: false,
        disabled: false,
    },
};
