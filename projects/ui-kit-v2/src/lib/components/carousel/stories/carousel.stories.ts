import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtCarouselComponent } from './component/test-carousel.component';

export default {
    title: 'Atoms/Carousel',
    component: TestRtCarouselComponent,
    argTypes: {
        count: { control: { type: 'range', min: 0, max: 6, step: 1 } },
        colored: { control: { type: 'boolean' } },
    },
} as Meta<TestRtCarouselComponent>;

type TStory = StoryObj<TestRtCarouselComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        count: 4,
        colored: true,
    },
};
