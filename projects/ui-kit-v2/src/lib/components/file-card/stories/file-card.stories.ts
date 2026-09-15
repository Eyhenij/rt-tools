import { Meta, StoryObj } from '@storybook/angular';

import { TestRtFileCardComponent } from './component/test-file-card.component';

export default {
    title: 'Molecules/Files/FileCard',
    component: TestRtFileCardComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        name: { control: { type: 'text' } },
        sizeBytes: { control: { type: 'number' } },
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        showDownload: { control: { type: 'boolean' } },
        showRemove: { control: { type: 'boolean' } },
        showRename: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtFileCardComponent>;

type TStory = StoryObj<TestRtFileCardComponent>;

export const Playground: TStory = {
    args: {
        name: 'Название',
        sizeBytes: null,
        size: 'md',
        showDownload: false,
        showRemove: false,
        showRename: false,
        disabled: false,
    },
};
