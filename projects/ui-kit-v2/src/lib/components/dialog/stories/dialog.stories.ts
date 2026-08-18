import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtDialogComponent } from './component/test-dialog.component';

export default {
    title: 'Components/Dialog',
    component: TestRtDialogComponent,
    argTypes: {
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        width: { control: { type: 'text' } },
        ariaLabel: { control: { type: 'text' } },
    },
} as Meta<TestRtDialogComponent>;

type TStory = StoryObj<TestRtDialogComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        size: 'md',
        width: null,
        ariaLabel: null,
    },
};
