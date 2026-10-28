import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtUsageRingComponent } from './component/test-usage-ring.component';

export default {
    title: 'Molecules/Chat/UsageRing',
    component: TestRtUsageRingComponent,
    argTypes: {
        value: { control: { type: 'range', min: 0, max: 100 } },
        warnAt: { control: { type: 'number' } },
        hint: { control: { type: 'text' } },
        part: { table: { disable: true } },
    },
} as Meta<TestRtUsageRingComponent>;

type TStory = StoryObj<TestRtUsageRingComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('снимок кольца заводится вместе с эталонами витрины следующей версии'),
    args: {
        value: 32,
        warnAt: 80,
        hint: '32% of the monthly limit · Resets on 1 November',
    },
};

/** Кольцо в обоих наборах: пресет перекрашивает дугу и подложку, разницу видно только парой. */
export const Presets: TStory = {
    parameters: {
        ...storySnapshotSkip('снимок кольца заводится вместе с эталонами витрины следующей версии'),
        controls: { disable: true },
    },
    args: { part: 'presets' },
};
