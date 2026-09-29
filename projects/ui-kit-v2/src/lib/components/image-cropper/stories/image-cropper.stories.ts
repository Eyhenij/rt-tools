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

/** Сколько ждём появления рамки после нажатия: картинка рисуется и читается за доли секунды */
const DEMO_WAIT_MS: number = 5000;

/**
 * Нажимает «Демо-картинка 1200×800» и ждёт рамку в поле ненулевой ширины. Одного появления рамки
 * мало: поле, сжатое раскладкой в ноль, рисует рамку 2×2, и человек не видит ничего.
 */
async function takeDemoImage({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    const button: HTMLButtonElement | null = canvasElement.querySelector('button[aria-label^="Демо-картинка"]');
    if (button === null) {
        throw new Error('Кнопки «Демо-картинка» в истории нет');
    }
    button.click();
    const started: number = Date.now();
    while (canvasElement.querySelector('[qa-dataid="image-cropper-frame"]') === null) {
        if (Date.now() - started > DEMO_WAIT_MS) {
            throw new Error(`Рамка не появилась за ${DEMO_WAIT_MS} мс`);
        }
        await new Promise((resolve: (value: unknown) => void): unknown => setTimeout(resolve, 50));
    }
    const field: HTMLElement | null = canvasElement.querySelector('[qa-dataid="image-cropper-field"]');
    if (field === null || field.clientWidth < 200) {
        throw new Error(`Поле обрезки сжато раскладкой: ширина ${field?.clientWidth ?? 'поля нет'}`);
    }
}

/**
 * Песочница после нажатия «Демо-картинка 1200×800»: в поле картинка и рамка. Жест делает
 * `play`, и он же падает, если рамки нет или поле сжато, — нажатие проверяется, а не предполагается.
 */
export const DemoImage: TStory = {
    args: { ...Playground.args },
    play: takeDemoImage,
};
