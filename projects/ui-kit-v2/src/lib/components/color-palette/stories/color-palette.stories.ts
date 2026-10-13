import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtColorPaletteComponent } from './component/test-color-palette.component';

export default {
    title: 'Organisms/Forms/ColorPalette',
    component: TestRtColorPaletteComponent,
    argTypes: {
        themeColors: { control: { type: 'boolean' } },
        readonly: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
        customAllowed: { control: { type: 'boolean' } },
        channels: { control: { type: 'boolean' } },
    },
} as Meta<TestRtColorPaletteComponent>;

type TStory = StoryObj<TestRtColorPaletteComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        themeColors: false,
        readonly: false,
        disabled: false,
        customAllowed: true,
        channels: false,
    },
};
