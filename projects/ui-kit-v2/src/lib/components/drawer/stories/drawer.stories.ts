import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtDrawerComponent } from './component/test-drawer.component';

export default {
    title: 'Organisms/Layout/Drawer',
    component: TestRtDrawerComponent,
    argTypes: {
        mode: { options: ['side', 'over'], control: { type: 'select' } },
        position: { options: ['start', 'end'], control: { type: 'select' } },
        hasBackdrop: { control: { type: 'boolean' } },
        disableClose: { control: { type: 'boolean' } },
        resizable: { control: { type: 'boolean' } },
    },
} as Meta<TestRtDrawerComponent>;

type TStory = StoryObj<TestRtDrawerComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('места, края и состояния уже стоят ячейками в матрицах этого компонента'),
    args: {
        mode: 'side',
        position: 'start',
        hasBackdrop: true,
        disableClose: false,
        resizable: true,
    },
};
