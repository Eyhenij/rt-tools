import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtLogoComponent } from './component/test-logo.component';

export default {
    title: 'Atoms/Logo',
    component: TestRtLogoComponent,
    argTypes: {
        variant: {
            options: ['wordmark', 'lockup'],
            control: { type: 'select' },
        },
        height: { control: { type: 'number' } },
        aspect: { control: { type: 'number' } },
        ariaLabel: { control: { type: 'text' } },
    },
} as Meta<TestRtLogoComponent>;

type TStory = StoryObj<TestRtLogoComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        variant: 'lockup',
        height: 0,
        aspect: 0,
        ariaLabel: '',
    },
};
