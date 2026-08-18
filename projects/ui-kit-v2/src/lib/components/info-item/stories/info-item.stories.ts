import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtInfoItemComponent } from './component/test-info-item.component';

export default {
    title: 'Components/InfoItem',
    component: TestRtInfoItemComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        value: { control: { type: 'text' } },
        loading: { control: { type: 'boolean' } },
        grow: { control: { type: 'boolean' } },
    },
} as Meta<TestRtInfoItemComponent>;

type TStory = StoryObj<TestRtInfoItemComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        label: 'Тариф',
        value: 'Годовой',
        loading: false,
        grow: false,
    },
};
