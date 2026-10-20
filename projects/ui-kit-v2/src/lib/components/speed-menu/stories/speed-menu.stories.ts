import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtSpeedMenuComponent } from './component/test-speed-menu.component';

const RADIO: { readonly control: { readonly type: 'inline-radio' } } = { control: { type: 'inline-radio' } };

export default {
    title: 'Molecules/Buttons/SpeedMenu',
    component: TestRtSpeedMenuComponent,
    argTypes: {
        direction: { ...RADIO, options: ['up', 'down', 'start', 'end'] },
        size: { ...RADIO, options: ['sm', 'md', 'lg', 'xl'] },
        variant: { ...RADIO, options: ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning'] },
        icon: { control: { type: 'text' } },
        label: { control: { type: 'text' } },
        closeOnSelect: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtSpeedMenuComponent>;

type TStory = StoryObj<TestRtSpeedMenuComponent>;

/** Живое меню масштаба: выбранное действие пишется под кнопкой. */
export const Playground: TStory = {
    parameters: storySnapshotSkip('кнопка меню и открытые стороны уже стоят в матрицах этого компонента'),
    args: {
        direction: 'up',
        size: 'lg',
        variant: 'primary',
        icon: 'zoom_in',
        label: 'Масштаб',
        closeOnSelect: false,
        disabled: false,
    },
};
