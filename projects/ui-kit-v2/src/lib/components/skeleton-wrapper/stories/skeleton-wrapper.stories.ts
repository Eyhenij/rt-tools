import { Meta, StoryObj } from '@storybook/angular';

import { TestRtSkeletonWrapperComponent } from './component/test-skeleton-wrapper.component';

export default {
    title: 'Components/SkeletonWrapper',
    component: TestRtSkeletonWrapperComponent,
    argTypes: {
        width: { control: { type: 'text' } },
        height: { control: { type: 'text' } },
        shape: {
            options: ['rectangle', 'circle', 'square'],
            control: { type: 'select' },
        },
        size: {
            options: ['sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        borderRadius: {
            options: ['xs', 'sm', 'md', 'lg', 'xl'],
            control: { type: 'select' },
        },
        animation: { control: { type: 'boolean' } },
        isLoading: { control: { type: 'boolean' } },
    },
} as Meta<TestRtSkeletonWrapperComponent>;

type Story = StoryObj<TestRtSkeletonWrapperComponent>;

export const Playground: Story = {
    args: {
        width: '100%',
        height: '15px',
        shape: 'rectangle',
        size: 'md',
        borderRadius: 'xl',
        animation: true,
        isLoading: false,
    },
};
