import { Meta, StoryObj } from '@storybook/angular';

import { TestRtComponentPropsComponent } from './component/test-component-props.component';

/**
 * История уровня основ, а не компонента: показывает приём, общий для всего кита, и поэтому
 * лежит при обвязке показа, а не в папке одного компонента. Договор о покрытии состояний к ней
 * не относится — у неё нет ни осей входов, ни состояний.
 */
export default {
    title: 'Foundation/Design Tokens/Component Props',
    component: TestRtComponentPropsComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtComponentPropsComponent>;

type TStory = StoryObj<TestRtComponentPropsComponent>;

export const ComponentProps: TStory = {};
