import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { TestImageUploadComponent } from './component/test-image-upload.component';

export default {
    title: 'Components/ImageUpload',
    component: TestImageUploadComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
} as Meta<TestImageUploadComponent>;

type Story = StoryObj<TestImageUploadComponent>;

/**
 * Картинка встроена в адрес, а не берётся из сети: внешний источник отдаёт каждый раз новое
 * изображение, и визуальная проверка витрины падала бы на нём при неизменном компоненте.
 */
const SAMPLE_IMAGE: string =
    'data:image/svg+xml;base64,' +
    btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
            '<rect width="200" height="200" fill="#4284d7"/>' +
            '<circle cx="100" cy="78" r="34" fill="#fff"/>' +
            '<path d="M40 170c0-33 27-52 60-52s60 19 60 52z" fill="#fff"/>' +
            '</svg>'
    );

export const ImageUpload: Story = {
    args: { imageUrl: SAMPLE_IMAGE },
};
