import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtToolbarLeftComponent } from './component/test-toolbar-left.component';

export default {
    title: 'Components/ToolbarLeft',
    component: TestRtToolbarLeftComponent,
    argTypes: {
        dense: { control: { type: 'boolean' } },
    },
} as Meta<TestRtToolbarLeftComponent>;

type Story = StoryObj<TestRtToolbarLeftComponent>;

export const Default: Story = {
    parameters: storySnapshotSkip(
        'директива висит на пустом `div`, и в кадре нет ни одной зоны панели; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        dense: false,
    },
};
