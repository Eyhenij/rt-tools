import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { TestSnackBarComponent } from './component/test-snack-bar.component';

export default {
    title: 'Components/Snack Bar',
    component: TestSnackBarComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
} as Meta<TestSnackBarComponent>;

type Story = StoryObj<TestSnackBarComponent>;

export const DefaultSnackBar: Story = {
    args: {},
};
