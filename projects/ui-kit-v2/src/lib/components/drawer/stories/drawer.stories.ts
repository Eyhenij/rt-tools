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
        overflow: { options: ['clip', 'visible'], control: { type: 'select' } },
        autoWidth: { control: { type: 'boolean' } },
        // Варианты — строки: смешанный список с признаками Storybook из адреса не читает, признаки
        // возвращает отображение.
        autoFocus: {
            options: ['true', 'false', 'first-tabbable', 'input'],
            mapping: { true: true, false: false },
            control: { type: 'select' },
        },
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
        overflow: 'clip',
        autoWidth: false,
        autoFocus: 'true',
    },
};
