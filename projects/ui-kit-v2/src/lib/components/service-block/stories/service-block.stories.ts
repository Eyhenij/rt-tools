import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { PLACEHOLDER_ROWS } from '../../service-logo/stories/component/story-placeholder-marks';
import { TestRtServiceBlockComponent } from './component/test-service-block.component';

export default {
    title: 'Molecules/ServiceBlock',
    component: TestRtServiceBlockComponent,
    argTypes: {
        logos: { control: { type: 'object' } },
        name: { control: { type: 'text' } },
        description: { control: { type: 'text' } },
    },
} as Meta<TestRtServiceBlockComponent>;

type TStory = StoryObj<TestRtServiceBlockComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('один знак с именем и описанием уже стоит ячейкой в матрице этого компонента'),
    args: {
        logos: PLACEHOLDER_ROWS[0],
        name: 'Платёжная служба',
        description: 'Приём оплаты тарифов картой',
    },
};
