import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../../showcase';
import { TestRtCopyCellComponent } from './component/test-copy-cell.component';

export default {
    title: 'Atoms/CopyCell',
    component: TestRtCopyCellComponent,
    argTypes: {
        value: { control: { type: 'text' } },
        variant: {
            options: ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning'],
            control: { type: 'select' },
        },
        revealOnHover: { control: { type: 'boolean' } },
    },
} as Meta<TestRtCopyCellComponent>;

type TStory = StoryObj<TestRtCopyCellComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip(
        'обёртка отдаёт пустое значение, и ячейка не рисует ничего; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        value: null,
        variant: 'ghost',
        revealOnHover: true,
    },
};
