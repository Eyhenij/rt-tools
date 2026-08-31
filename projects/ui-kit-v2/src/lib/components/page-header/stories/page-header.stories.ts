import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtPageHeaderComponent } from './component/test-page-header.component';

export default {
    title: 'Molecules/Navigation/PageHeader',
    component: TestRtPageHeaderComponent,
    argTypes: {
        items: { control: false },
        user: { control: false },
        userTitle: { control: { type: 'text' } },
        userMenu: { control: false },
        ariaLabel: { control: { type: 'text' } },
        panelMode: { control: { type: 'inline-radio' }, options: ['hover', 'pinned'] },
    },
} as Meta<TestRtPageHeaderComponent>;

type TStory = StoryObj<TestRtPageHeaderComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        userTitle: '',
        userMenu: null,
        ariaLabel: '',
        panelMode: 'hover',
    },
};
