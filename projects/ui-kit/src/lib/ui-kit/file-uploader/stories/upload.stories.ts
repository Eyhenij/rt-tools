import { Meta, StoryObj } from '@storybook/angular';

import { TestFileUploadComponent } from './component/test-file-upload.component';

export default {
    title: 'Components/FileUpload',
    component: TestFileUploadComponent,
} as Meta<TestFileUploadComponent>;

type TStory = StoryObj<TestFileUploadComponent>;

export const FileUpload: TStory = {
    args: {},
};
