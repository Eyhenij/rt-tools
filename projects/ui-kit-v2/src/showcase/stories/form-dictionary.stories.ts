import { Meta, StoryObj } from '@storybook/angular';

import { TestRtFormDictionaryComponent } from './component/test-form-dictionary.component';

/**
 * История уровня основ, а не компонента: показывает словарь, общий для всех панелей кита, и
 * поэтому лежит при обвязке показа. Договор о покрытии состояний к ней не относится — у словаря
 * нет ни осей входов, ни состояний.
 */
export default {
    title: 'Foundation/Design Tokens/Form Dictionary',
    component: TestRtFormDictionaryComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { fullPage: true },
    },
} as Meta<TestRtFormDictionaryComponent>;

type TStory = StoryObj<TestRtFormDictionaryComponent>;

export const FormDictionary: TStory = {};
