import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtFilterControlComponent } from './component/test-filter-control.component';

export default {
    title: 'Molecules/Forms/FilterControl',
    component: TestRtFilterControlComponent,
    argTypes: {
        options: { control: false },
        value: { control: { type: 'text' } },
        ariaLabel: { control: { type: 'text' } },
        placeholder: { control: { type: 'text' } },
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        disabled: { control: { type: 'boolean' } },
        fullWidth: { control: { type: 'boolean' } },
    },
} as Meta<TestRtFilterControlComponent>;

type TStory = StoryObj<TestRtFilterControlComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        options: [],
        // eslint-disable-next-line sonarjs/no-undefined-assignment -- вход кита объявлен с пустотой, и «ничего не выбрано» на нём выражается только ею
        value: undefined,
        ariaLabel: null,
        placeholder: 'Введите значение',
        size: 'sm',
        disabled: false,
        fullWidth: false,
    },
};
