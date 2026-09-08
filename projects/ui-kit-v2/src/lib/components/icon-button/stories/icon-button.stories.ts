import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtIconButtonComponent } from './component/test-icon-button.component';

export default {
    title: 'Atoms/Buttons/IconButton',
    component: TestRtIconButtonComponent,
    argTypes: {
        icon: { control: false },
        ariaLabel: { control: { type: 'text' } },
        variant: {
            options: ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning'],
            control: { type: 'select' },
        },
        iconColor: {
            options: ['current', 'muted', 'info', 'success', 'warning', 'danger', 'inverse'],
            control: { type: 'select' },
        },
        size: {
            options: ['sm', 'md', 'lg', 'xl', '2xl'],
            control: { type: 'select' },
        },
        iconSize: { control: false },
        shape: {
            options: ['square', 'rounded-sm', 'rounded-lg', 'circle'],
            control: { type: 'select' },
        },
        type: {
            options: ['button', 'submit'],
            control: { type: 'select' },
        },
        tooltip: { control: { type: 'text' } },
        tabIndex: { control: { type: 'number' } },
        loading: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
        active: { control: { type: 'boolean' } },
        indicator: { control: { type: 'boolean' } },
    },
} as Meta<TestRtIconButtonComponent>;

type TStory = StoryObj<TestRtIconButtonComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        icon: 'alarm-clock',
        ariaLabel: 'Править',
        variant: 'ghost',
        iconColor: 'current',
        size: 'md',
        iconSize: null,
        shape: 'square',
        type: 'button',
        tooltip: '',
        tabIndex: 0,
        loading: false,
        disabled: false,
        active: false,
        indicator: false,
    },
};
