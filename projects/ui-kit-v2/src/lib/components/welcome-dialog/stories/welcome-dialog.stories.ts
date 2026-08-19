import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtWelcomeDialogComponent } from './component/test-welcome-dialog.component';

export default {
    title: 'Organisms/Dialog/WelcomeDialog',
    component: TestRtWelcomeDialogComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtWelcomeDialogComponent>;

type TStory = StoryObj<TestRtWelcomeDialogComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('тот же случай уже стоит ячейкой «заголовок и два абзаца» в матрице этого компонента'),
};
