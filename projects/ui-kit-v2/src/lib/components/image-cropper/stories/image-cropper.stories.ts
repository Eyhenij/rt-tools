import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtImageCropperComponent } from './component/test-image-cropper.component';

export default {
    title: 'Organisms/ImageCropper',
    component: TestRtImageCropperComponent,
    argTypes: {
        ratio: { control: { type: 'number', min: 0.2, max: 5, step: 0.1 } },
        round: { control: { type: 'boolean' } },
        minSize: { control: { type: 'number', min: 1, step: 1 } },
        format: { control: { type: 'select' }, options: [null, 'png', 'jpeg', 'webp'] },
        quality: { control: { type: 'range', min: 0, max: 100, step: 1 } },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtImageCropperComponent>;

type TStory = StoryObj<TestRtImageCropperComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('исходник рисуется холстом, а результат приходит после чтения файла — кадры семьи снимает её матрица'),
    args: {
        ratio: null,
        round: false,
        minSize: 16,
        format: null,
        quality: 92,
        disabled: false,
    },
};
