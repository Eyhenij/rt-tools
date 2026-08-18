// eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { TestFileUploadComponent } from './component/test-file-upload.component';

export default {
    title: 'Components/FileUpload',
    component: TestFileUploadComponent,
    decorators: [
        applicationConfig({
            // eslint-disable-next-line sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843
            providers: [provideAnimations()],
        }),
    ],
} as Meta<TestFileUploadComponent>;

type TStory = StoryObj<TestFileUploadComponent>;

export const FileUpload: TStory = {
    args: {},
};
