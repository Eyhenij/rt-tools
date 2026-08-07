import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDeltaViewComponent } from './component/test-delta-view.component';

export default {
    title: 'Components/DeltaView',
    component: TestRtDeltaViewComponent,
    argTypes: {
        delta: { control: false },
    },
} as Meta<TestRtDeltaViewComponent>;

type Story = StoryObj<TestRtDeltaViewComponent>;

/** Модель берётся из обёртки: контрола у входа нет, а `null` рисовал бы пустую историю. */
export const Playground: Story = {};
