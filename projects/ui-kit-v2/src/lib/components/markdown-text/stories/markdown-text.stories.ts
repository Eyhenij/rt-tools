import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMarkdownTextComponent } from './component/test-markdown-text.component';

export default {
    title: 'Molecules/MarkdownText',
    component: TestRtMarkdownTextComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        text: { control: { type: 'text' } },
    },
} as Meta<TestRtMarkdownTextComponent>;

type TStory = StoryObj<TestRtMarkdownTextComponent>;

export const Playground: TStory = {
    args: {
        text: '# Заголовок\n\nАбзац с **жирным**, *курсивом* и `кодом`.\n\n- первый пункт\n- второй пункт',
    },
};
