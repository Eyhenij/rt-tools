import { Meta, StoryObj } from '@storybook/angular';

import { TestRtBottomSheetComponent } from './component/test-bottom-sheet.component';

export default {
    title: 'Components/BottomSheet',
    component: TestRtBottomSheetComponent,
    argTypes: {
        open: { control: { type: 'boolean' } },
    },
} as Meta<TestRtBottomSheetComponent>;

type Story = StoryObj<TestRtBottomSheetComponent>;

export const Default: Story = {
    args: {
        open: false,
    },
};
