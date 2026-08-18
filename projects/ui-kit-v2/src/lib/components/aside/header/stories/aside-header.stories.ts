import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../../showcase';
import { TestRtAsideHeaderComponent } from './component/test-aside-header.component';

export default {
    title: 'Components/AsideHeader',
    component: TestRtAsideHeaderComponent,
    argTypes: {
        title: { control: { type: 'text' } },
        overline: { control: { type: 'text' } },
        badges: { control: false },
        closable: { control: { type: 'boolean' } },
        loading: { control: { type: 'boolean' } },
    },
} as Meta<TestRtAsideHeaderComponent>;

type TStory = StoryObj<TestRtAsideHeaderComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        title: 'Заголовок',
        overline: null,
        badges: [],
        closable: true,
        loading: false,
    },
};
