import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { TestButtonMatrixComponent } from './component/test-button-matrix.component';
import { TestButtonComponent } from './component/test-button.component';

export default {
    title: 'Components/Button',
    component: TestButtonComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
    argTypes: {
        type: {
            options: ['icon', 'fab', 'pill'],
            control: { type: 'select' },
        },
        variant: {
            options: ['default', 'primary', 'danger', 'success', 'warning', 'accent'],
            control: { type: 'select' },
        },
        size: {
            options: ['xs', 'sm', 'md', 'lg'],
            control: { type: 'select' },
        },
        radius: {
            options: [undefined, 'none', 'sm', 'md', 'lg', 'full'],
            control: { type: 'select' },
        },
        appearance: {
            options: [undefined, 'solid', 'outline', 'light', 'text'],
            control: { type: 'select' },
        },
        iconPosition: {
            options: ['start', 'end'],
            control: { type: 'inline-radio' },
        },
        iconSize: {
            options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', '3xl'],
            control: { type: 'select' },
        },
    },
} as Meta<TestButtonComponent>;

type Story = StoryObj<TestButtonComponent>;

export const Playground: Story = {
    args: {
        type: 'pill',
        variant: 'default',
        size: 'md',
        icon: 'add',
        text: 'Button',
        iconPosition: 'start',
        loading: false,
        disabled: false,
        outlined: true,
        fullWidth: false,
    },
};

/**
 * Все оси разом. Эта история — эталон для замеров: по `data-case` снимаются вычисленные
 * отступы, скругления и кегль, и правка каскада сверяется числом, а не на глаз.
 */
export const Matrix: StoryObj<TestButtonMatrixComponent> = {
    render: () => ({
        moduleMetadata: { imports: [TestButtonMatrixComponent] },
        template: '<app-button-matrix />',
    }),
};
