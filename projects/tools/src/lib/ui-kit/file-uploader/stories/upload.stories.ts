import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { TestFileUploadComponent } from './component/test-file-upload.component';

export default {
    title: 'Components/FileUpload',
    component: TestFileUploadComponent,
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
} as Meta<TestFileUploadComponent>;

type Story = StoryObj<TestFileUploadComponent>;

export const FileUpload: Story = {
    args: {},
};
