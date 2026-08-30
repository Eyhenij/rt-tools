import { Meta, StoryObj } from '@storybook/angular';

import { EToggleSizeType } from '../toggle-size.type.enum';
import { TestToggleComponent } from './component/test-toggle.component';

export default {
    title: 'Components/Toggle',
    component: TestToggleComponent,
    argTypes: {
        size: {
            type: 'string',
            options: [EToggleSizeType.MD, EToggleSizeType.SM, 'fat'],
            control: { type: 'select' },
        },
    },
} as Meta<TestToggleComponent>;

type TStory = StoryObj<TestToggleComponent>;

export const Toggle: TStory = {
    args: {
        value: true,
        disabled: false,
        tooltipDisabled: false,
        size: EToggleSizeType.MD,
        label: 'Label Example',
        tooltip: 'Tooltip Example',
        tooltipPosition: 'below',
    },
};
