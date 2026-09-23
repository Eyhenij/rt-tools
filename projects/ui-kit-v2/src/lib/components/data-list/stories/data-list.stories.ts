import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtDataListComponent } from './component/test-data-list.component';

export default {
    title: 'Organisms/DataList/DataList',
    component: TestRtDataListComponent,
    argTypes: {
        filtersShown: { control: { type: 'boolean' } },
        loading: { control: { type: 'boolean' } },
        fetching: { control: { type: 'boolean' } },
        selectAllShown: { control: { type: 'boolean' } },
        multiSelect: { control: { type: 'boolean' } },
        rows: { control: false },
        page: { control: false },
        columns: { control: false },
    },
} as Meta<TestRtDataListComponent>;

type TStory = StoryObj<TestRtDataListComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        filtersShown: false,
        loading: false,
        fetching: false,
        selectAllShown: true,
        multiSelect: true,
    },
};
