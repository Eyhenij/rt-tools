import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtDeltaViewComponent } from './component/test-delta-view.component';

export default {
    title: 'Components/DeltaView',
    component: TestRtDeltaViewComponent,
    argTypes: {
        delta: { control: false },
    },
} as Meta<TestRtDeltaViewComponent>;

type TStory = StoryObj<TestRtDeltaViewComponent>;

/** Модель берётся из обёртки: контрола у входа нет, а `null` рисовал бы пустую историю. */
export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
};
