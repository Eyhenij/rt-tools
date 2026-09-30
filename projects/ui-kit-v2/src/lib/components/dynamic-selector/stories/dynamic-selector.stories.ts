import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDynamicSelectorComponent } from './component/test-dynamic-selector.component';

export default {
    title: 'Organisms/Forms/DynamicSelector',
    component: TestRtDynamicSelectorComponent,
    argTypes: {
        mode: { control: { type: 'inline-radio' }, options: ['multi', 'single'] },
        draggable: { control: { type: 'boolean' } },
        invitation: { control: { type: 'boolean' } },
        multiToggleShown: { control: { type: 'boolean' } },
    },
} as Meta<TestRtDynamicSelectorComponent>;

type TStory = StoryObj<TestRtDynamicSelectorComponent>;

/** Кнопка «Add» открывает окно выбора под полем; сброс включается после первой правки списка. */
export const Playground: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: {
        mode: 'multi',
        draggable: true,
        invitation: false,
        multiToggleShown: false,
    },
};
