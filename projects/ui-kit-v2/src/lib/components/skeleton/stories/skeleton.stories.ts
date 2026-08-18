import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtSkeletonComponent } from './component/test-skeleton.component';

export default {
    title: 'Components/Skeleton',
    component: TestRtSkeletonComponent,
    argTypes: {
        shape: {
            options: ['rectangle', 'circle', 'square'],
            control: { type: 'select' },
        },
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        width: { control: { type: 'text' } },
        height: { control: { type: 'text' } },
        borderRadius: {
            options: ['xs', 'sm', 'md', 'lg', 'xl'],
            control: { type: 'select' },
        },
        animation: { control: { type: 'boolean' } },
    },
} as Meta<TestRtSkeletonComponent>;

type TStory = StoryObj<TestRtSkeletonComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        shape: 'rectangle',
        size: 'md',
        width: '100%',
        height: '',
        borderRadius: 'xl',
        animation: true,
    },
};
