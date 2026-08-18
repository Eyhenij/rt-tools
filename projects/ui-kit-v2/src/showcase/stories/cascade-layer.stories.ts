import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCascadeLayerComponent } from './component/test-cascade-layer.component';

/**
 * История уровня основ, а не компонента: показывает приём, общий для всего кита, и поэтому
 * лежит при обвязке показа, а не в папке одного компонента. Договор о покрытии состояний к ней
 * не относится — у неё нет ни осей входов, ни состояний.
 */
export default {
    title: 'Foundation/Design Tokens/Cascade Layer',
    component: TestRtCascadeLayerComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtCascadeLayerComponent>;

type TStory = StoryObj<TestRtCascadeLayerComponent>;

export const CascadeLayer: TStory = {};
