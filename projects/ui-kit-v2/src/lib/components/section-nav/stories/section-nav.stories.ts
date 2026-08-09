import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtSectionNavComponent } from './component/test-section-nav.component';

export default {
    title: 'Components/SectionNav',
    component: TestRtSectionNavComponent,
    argTypes: {
        items: { control: false },
    },
} as Meta<TestRtSectionNavComponent>;

type Story = StoryObj<TestRtSectionNavComponent>;

export const Default: Story = {
    parameters: storySnapshotSkip(
        'обёртка отдаёт пустой `items`, и полоса разделов пуста; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        items: [],
    },
};
