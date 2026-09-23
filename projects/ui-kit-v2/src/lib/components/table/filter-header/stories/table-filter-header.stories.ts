import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTableFilterHeaderComponent } from './component/test-table-filter-header.component';

export default {
    title: 'Organisms/Table/TableFilterHeaderPlayground',
    component: TestRtTableFilterHeaderComponent,
    argTypes: {
        kind: { control: { type: 'inline-radio' }, options: ['text', 'number', 'select', 'date'] },
    },
} as Meta<TestRtTableFilterHeaderComponent>;

type TStory = StoryObj<TestRtTableFilterHeaderComponent>;

/** Живой отбор: выбранное меняет набор условий, и набор виден под ячейкой. */
export const Playground: TStory = {
    args: {
        kind: 'text',
    },
};
