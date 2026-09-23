import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtDynamicListComponent } from './component/test-dynamic-list.component';

export default {
    title: 'Organisms/Table/DynamicList',
    component: TestRtDynamicListComponent,
} as Meta<TestRtDynamicListComponent>;

type TStory = StoryObj<TestRtDynamicListComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        showSearch: true,
        showRefresh: true,
        showClearFilters: true,
        showColumnSettings: true,
        selectable: true,
        filtered: true,
    },
};
