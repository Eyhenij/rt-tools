import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { TestSnackBarComponent } from './component/test-snack-bar.component';

const longMsg: string =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const defaultArgs: {
    isProgressBarShown: boolean;
    isColoredBackground: boolean;
    action: string;
    defaultMessage: string;
    successMessage: string;
    errorMessage: string;
    warningMessage: string;
} = {
    isProgressBarShown: false,
    isColoredBackground: false,
    action: '',
    defaultMessage: 'Default Snack Bar opened',
    successMessage: 'Success Snack Bar opened',
    errorMessage: 'Error Snack Bar opened',
    warningMessage: 'Warning Snack Bar opened',
};

export default {
    title: 'Components/SnackBar',
    component: TestSnackBarComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
} as Meta<TestSnackBarComponent>;

type Story = StoryObj<TestSnackBarComponent>;

export const SnackBarDefault: Story = {
    args: { ...defaultArgs },
};

export const SnackBarColored: Story = {
    args: {
        ...defaultArgs,
        isColoredBackground: true,
    },
};

export const SnackBarWithProgressBar: Story = {
    args: {
        ...defaultArgs,
        isProgressBarShown: true,
    },
};

export const SnackBarWithActions: Story = {
    args: {
        ...defaultArgs,
        action: 'Action button title',
    },
};

export const SnackBarWithLongTitles: Story = {
    args: {
        ...defaultArgs,
        defaultMessage: longMsg,
        successMessage: longMsg,
        errorMessage: longMsg,
        warningMessage: longMsg,
    },
};

export const SnackBarWithLongTitlesAndActions: Story = {
    args: {
        ...defaultArgs,
        action: 'Action button title',
        defaultMessage: longMsg,
        successMessage: longMsg,
        errorMessage: longMsg,
        warningMessage: longMsg,
    },
};
