import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { PLACEHOLDER_ROWS } from './component/story-placeholder-marks';
import { TestRtServiceLogoComponent } from './component/test-service-logo.component';

export default {
    title: 'Molecules/ServiceLogo',
    component: TestRtServiceLogoComponent,
    argTypes: {
        size: {
            options: ['xs', 'sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        logos: { control: { type: 'object' } },
    },
} as Meta<TestRtServiceLogoComponent>;

type TStory = StoryObj<TestRtServiceLogoComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('три знака размера md уже стоят ячейкой в матрице этого компонента'),
    args: {
        size: 'md',
        logos: PLACEHOLDER_ROWS[2],
    },
};
