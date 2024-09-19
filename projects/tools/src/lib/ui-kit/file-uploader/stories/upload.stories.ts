import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryObj, applicationConfig } from '@storybook/angular';

import { TestFileUploadComponent } from './component/test-file-upload.component';

export default {
    title: 'Components/FileUpload',
    component: TestFileUploadComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
} as Meta<TestFileUploadComponent>;

type Story = StoryObj<TestFileUploadComponent>;

export const FileUpload: Story = {
    args: {},
};
