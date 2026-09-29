import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtImageCropperComponent } from './component/test-image-cropper.component';

export default {
    title: 'Organisms/ImageCropper',
    component: TestRtImageCropperComponent,
    argTypes: {
        placeholder: { control: { type: 'text' } },
        ratio: { control: { type: 'number', min: 0.2, max: 5, step: 0.1 } },
        round: { control: { type: 'boolean' } },
        minSize: { control: { type: 'number', min: 1, step: 1 } },
        format: { control: { type: 'select' }, options: [null, 'png', 'jpeg', 'webp'] },
        quality: { control: { type: 'range', min: 0, max: 100, step: 1 } },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtImageCropperComponent>;

type TStory = StoryObj<TestRtImageCropperComponent>;

/**
 * Сценарий работы: выбрать изображение кнопкой, бросить его на поле или взять пример, подвинуть
 * рамку и применить. Язык подписей кита переключается на панели витрины.
 */
export const Playground: TStory = {
    parameters: storySnapshotSkip('сценарий работы с кнопками и выбором файла — кадры семьи снимает её матрица'),
    args: {
        placeholder: '',
        ratio: null,
        round: false,
        minSize: 16,
        format: null,
        quality: 92,
        disabled: false,
    },
};
