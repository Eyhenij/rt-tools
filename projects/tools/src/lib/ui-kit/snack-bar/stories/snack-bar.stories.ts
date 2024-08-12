import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { TestSnackBarComponent } from './component/test-snack-bar.component';

export default {
    title: 'Components/SnackBar',
    component: TestSnackBarComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
} as Meta<TestSnackBarComponent>;

type Story = StoryObj<TestSnackBarComponent>;

export const SnackBarDefault: Story = {
    args: {
        isDurationShownFalse: false,
        isColoredBackground: false,
        action: '',
        defaultMessage: 'Default Snack Bar opened',
        successMessage: 'Success Snack Bar opened',
        errorMessage: 'Error Snack Bar opened',
        warningMessage: 'Warning Snack Bar opened',
    },
};

export const SnackBarColored: Story = {
    args: {
        isDurationShownFalse: false,
        isColoredBackground: true,
        action: '',
        defaultMessage: 'Default Snack Bar opened',
        successMessage: 'Success Snack Bar opened',
        errorMessage: 'Error Snack Bar opened',
        warningMessage: 'Warning Snack Bar opened',
    },
};

export const SnackBarWithProgressBar: Story = {
    args: {
        isDurationShownFalse: true,
        isColoredBackground: false,
        action: '',
        defaultMessage: 'Default Snack Bar opened',
        successMessage: 'Success Snack Bar opened',
        errorMessage: 'Error Snack Bar opened',
        warningMessage: 'Warning Snack Bar opened',
    },
};

export const SnackBarWithActions: Story = {
    args: {
        isDurationShownFalse: false,
        isColoredBackground: false,
        action: 'Action button title',
        defaultMessage: 'Default Snack Bar opened',
        successMessage: 'Success Snack Bar opened',
        errorMessage: 'Error Snack Bar opened',
        warningMessage: 'Warning Snack Bar opened',
    },
};

export const SnackBarWithLongTitles: Story = {
    args: {
        isDurationShownFalse: false,
        isColoredBackground: false,
        action: '',
        defaultMessage:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s',
        successMessage:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s',
        errorMessage:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s',
        warningMessage:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s',
    },
};

export const SnackBarWithLongTitlesAndActions: Story = {
    args: {
        isDurationShownFalse: false,
        isColoredBackground: false,
        action: 'Action button title',
        defaultMessage:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s',
        successMessage:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s',
        errorMessage:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s',
        warningMessage:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s',
    },
};
