import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtDataTableComponent } from './component/test-data-table.component';

export default {
    title: 'Organisms/Tables & Lists/DataTable',
    component: TestRtDataTableComponent,
    argTypes: {
        filtersShown: { control: { type: 'boolean' } },
        clickable: { control: { type: 'boolean' } },
        selectorsShown: { control: { type: 'boolean' } },
        multiSelect: { control: { type: 'boolean' } },
        selectorsDisabled: { control: { type: 'boolean' } },
        withRowActions: { control: { type: 'boolean' } },
        rows: { control: false },
        columns: { control: false },
    },
} as Meta<TestRtDataTableComponent>;

type TStory = StoryObj<TestRtDataTableComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        filtersShown: false,
        clickable: false,
        selectorsShown: true,
        multiSelect: true,
        selectorsDisabled: false,
        withRowActions: true,
    },
};
