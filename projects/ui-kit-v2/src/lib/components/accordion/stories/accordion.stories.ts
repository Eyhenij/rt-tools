import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtAccordionComponent } from './component/test-accordion.component';

export default {
    title: 'Molecules/Accordion',
    component: TestRtAccordionComponent,
    argTypes: {
        items: { control: false },
        openIndex: { control: { type: 'number' } },
    },
} as Meta<TestRtAccordionComponent>;

type TStory = StoryObj<TestRtAccordionComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        openIndex: 0,
    },
};
