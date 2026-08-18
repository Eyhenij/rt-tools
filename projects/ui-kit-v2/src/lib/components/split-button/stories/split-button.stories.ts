import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtSplitButtonComponent } from './component/test-split-button.component';

export default {
    title: 'Components/SplitButton',
    component: TestRtSplitButtonComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        menuItems: { control: false },
        theme: { control: false },
        size: { control: false },
        menuAriaLabel: { control: { type: 'text' } },
        loading: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtSplitButtonComponent>;

type TStory = StoryObj<TestRtSplitButtonComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        label: 'Сохранить',
        theme: 'primary',
        size: 'md',
        menuAriaLabel: '',
        loading: false,
        disabled: false,
    },
};
