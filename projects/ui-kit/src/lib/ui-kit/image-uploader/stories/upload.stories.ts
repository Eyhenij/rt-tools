import { provideAnimations } from '@angular/platform-browser/animations';
import { faker } from '@faker-js/faker';
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

export const ImageUpload: Story = {
    args: { imageUrl: faker.image.url({ width: 200, height: 200 }) },
};
