import { Meta, StoryObj } from '@storybook/angular';

import { TestRtBottomSheetComponent } from './component/test-bottom-sheet.component';

export default {
    title: 'Organisms/Aside/BottomSheet',
    component: TestRtBottomSheetComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        open: { control: { type: 'boolean' } },
    },
} as Meta<TestRtBottomSheetComponent>;

type TStory = StoryObj<TestRtBottomSheetComponent>;

/** Лист показан открытым: закрытый не рисует ничего, и кадр закрепил бы пустую страницу. */
export const Playground: TStory = {
    args: {
        open: true,
    },
};
