import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtBreadcrumbsComponent } from './component/test-breadcrumbs.component';

export default {
    title: 'Molecules/Navigation/Breadcrumbs',
    component: TestRtBreadcrumbsComponent,
    argTypes: {
        depth: { control: { type: 'range', min: 1, max: 6, step: 1 } },
        look: { control: { type: 'inline-radio' }, options: ['inline', 'heading'] },
        back: { control: { type: 'boolean' } },
        separator: { control: { type: 'text' } },
    },
} as Meta<TestRtBreadcrumbsComponent>;

type TStory = StoryObj<TestRtBreadcrumbsComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('путь с кнопкой «назад» уже стоит ячейкой в матрице этого компонента'),
    args: {
        depth: 3,
        look: 'inline',
        back: true,
        separator: '/',
    },
};
