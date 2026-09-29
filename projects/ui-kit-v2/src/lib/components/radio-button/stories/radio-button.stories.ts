import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtRadioButtonComponent } from './component/test-radio-button.component';

export default {
    title: 'Atoms/Forms/RadioButton',
    component: TestRtRadioButtonComponent,
    argTypes: {
        checked: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
        card: { control: { type: 'boolean' } },
        label: { control: { type: 'text' } },
        description: { control: { type: 'text' } },
        ariaLabel: { control: { type: 'text' } },
    },
} as Meta<TestRtRadioButtonComponent>;

type TStory = StoryObj<TestRtRadioButtonComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        checked: false,
        disabled: false,
        card: false,
        label: 'Москва',
        description: '',
        ariaLabel: null,
    },
};
