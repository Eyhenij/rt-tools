import { Meta, StoryObj } from '@storybook/angular';

import { TestRtCollapsibleTextComponent } from './component/test-collapsible-text.component';

export default {
    title: 'Molecules/CollapsibleText',
    component: TestRtCollapsibleTextComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        paragraphs: { control: false },
        clampLines: { control: { type: 'number' } },
    },
} as Meta<TestRtCollapsibleTextComponent>;

type TStory = StoryObj<TestRtCollapsibleTextComponent>;

export const Playground: TStory = {
    args: {
        paragraphs: ['Первый абзац.', 'Второй абзац.'],
        clampLines: 6,
    },
};
