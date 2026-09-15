import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtScrollAreaComponent } from './component/test-scroll-area.component';

export default {
    title: 'Organisms/Layout/ScrollArea',
    component: TestRtScrollAreaComponent,
} as Meta<TestRtScrollAreaComponent>;

type TStory = StoryObj<TestRtScrollAreaComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        isScrollHintShown: true,
        hasHeader: true,
        hasFooter: true,
    },
};
