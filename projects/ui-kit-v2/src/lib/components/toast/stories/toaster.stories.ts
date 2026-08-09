import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtToasterComponent } from './component/test-toaster.component';

export default {
    title: 'Components/Toaster',
    component: TestRtToasterComponent,
    argTypes: {
        position: {
            options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
            control: { type: 'select' },
        },
        duration: { control: { type: 'number' } },
        visibleToasts: { control: { type: 'number' } },
        expand: { control: { type: 'boolean' } },
    },
} as Meta<TestRtToasterComponent>;

type Story = StoryObj<TestRtToasterComponent>;

export const Default: Story = {
    parameters: storySnapshotSkip(
        'уведомление никем не отправлено, и стопка пуста; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        position: 'bottom-right',
        duration: 4000,
        visibleToasts: 3,
        expand: false,
    },
};
