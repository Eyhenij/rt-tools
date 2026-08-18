import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtSelectComponent } from './component/test-select.component';

export default {
    title: 'Components/Select',
    component: TestRtSelectComponent,
    argTypes: {
        options: { control: false },
        placeholder: { control: { type: 'text' } },
        iconLeft: { control: false },
        filter: { control: { type: 'boolean' } },
        filterPlaceholder: { control: { type: 'text' } },
    },
} as Meta<TestRtSelectComponent>;

type TStory = StoryObj<TestRtSelectComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        placeholder: 'Выберите город',
        iconLeft: null,
        filter: false,
        filterPlaceholder: '',
    },
};
