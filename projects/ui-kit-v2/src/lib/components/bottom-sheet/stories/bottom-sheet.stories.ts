import { Meta, StoryObj } from '@storybook/angular';

import { TestRtBottomSheetComponent } from './component/test-bottom-sheet.component';

export default {
    title: 'Components/BottomSheet',
    component: TestRtBottomSheetComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        open: { control: { type: 'boolean' } },
    },
} as Meta<TestRtBottomSheetComponent>;

type Story = StoryObj<TestRtBottomSheetComponent>;

/** Лист показан открытым: закрытый не рисует ничего, и кадр закрепил бы пустую страницу. */
export const Playground: Story = {
    args: {
        open: true,
    },
};
