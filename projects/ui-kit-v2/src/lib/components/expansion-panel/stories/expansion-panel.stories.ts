import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtExpansionPanelComponent } from './component/test-expansion-panel.component';

export default {
    title: 'Molecules/ExpansionPanel',
    component: TestRtExpansionPanelComponent,
    argTypes: {
        appearance: { control: { type: 'inline-radio' }, options: ['card', 'plain'] },
        expanded: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
        hideToggle: { control: { type: 'boolean' } },
    },
} as Meta<TestRtExpansionPanelComponent>;

type TStory = StoryObj<TestRtExpansionPanelComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейками в матрицах этого компонента'),
    args: {
        appearance: 'card',
        expanded: true,
        disabled: false,
        hideToggle: false,
    },
};
