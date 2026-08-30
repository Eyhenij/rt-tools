import { Meta, StoryObj } from '@storybook/angular';

import { TestRtScrollbarComponent } from './component/test-scrollbar.component';

/**
 * История уровня основ, а не компонента: полоса прокрутки оформлена в подслое основы для всех зон
 * кита разом, и своих осей входов у неё нет. Договор о покрытии состояний к ней не относится.
 */
export default {
    title: 'Foundation/Design Tokens/Scrollbar',
    component: TestRtScrollbarComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtScrollbarComponent>;

type TStory = StoryObj<TestRtScrollbarComponent>;

export const Scrollbar: TStory = {};
