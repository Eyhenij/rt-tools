import { Meta, StoryObj } from '@storybook/angular';

import { TestRtAsideSectionComponent } from './component/test-aside-section.component';

export default {
    title: 'Organisms/Aside/AsideSection',
    component: TestRtAsideSectionComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        heading: { control: { type: 'text' } },
    },
} as Meta<TestRtAsideSectionComponent>;

type TStory = StoryObj<TestRtAsideSectionComponent>;

export const Default: TStory = {
    args: {
        heading: 'Заголовок',
    },
};
