import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtTableCardComponent } from './component/test-table-card.component';

export default {
    title: 'Components/TableCard',
    component: TestRtTableCardComponent,
    argTypes: {
        rtTableCardRowType: { control: false },
    },
} as Meta<TestRtTableCardComponent>;

type Story = StoryObj<TestRtTableCardComponent>;

export const Default: Story = {
    parameters: storySnapshotSkip(
        'обёртка не передаёт строку, и карточка не рисует ничего; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        rtTableCardRowType: [],
    },
};
