import { Meta, StoryObj } from '@storybook/angular';

import { drawStoryCropperSample } from '../../image-cropper/stories/component/story-cropper-sample';
import { TestRtImageUploadComponent } from './component/test-image-upload.component';

export default {
    title: 'Organisms/ImageUpload',
    component: TestRtImageUploadComponent,
    // Загрузчик показан сам по себе, как в истории первого кита, без сетки витрины: кадр — вся страница.
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        fileName: { control: { type: 'text' } },
        tooltip: { control: { type: 'text' } },
        downloadable: { control: { type: 'boolean' } },
        autoApply: { control: { type: 'boolean' } },
        loading: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
        ratio: { control: { type: 'number', min: 0.2, max: 5, step: 0.1 } },
        round: { control: { type: 'boolean' } },
        format: { control: { type: 'select' }, options: [null, 'png', 'jpeg', 'webp'] },
        quality: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    },
} as Meta<TestRtImageUploadComponent>;

type TStory = StoryObj<TestRtImageUploadComponent>;

/**
 * Загрузчик с текущей картинкой, как в истории первого кита: нажатие на картинку выбирает файл,
 * за выбором идут обрезка и «Отмена» с «Применить», кнопка в углу скачивает картинку.
 */
export const Playground: TStory = {
    args: {
        fileName: 'logo.png',
        tooltip: '',
        downloadable: true,
        autoApply: false,
        loading: false,
        disabled: false,
        ratio: null,
        round: false,
        format: null,
        quality: 92,
    },
};

/** Сколько ждём шага сценария: картинка рисуется и читается за доли секунды */
const STEP_WAIT_MS: number = 5000;

async function waitFor(what: string, ready: () => boolean): Promise<void> {
    const started: number = Date.now();
    while (!ready()) {
        if (Date.now() - started > STEP_WAIT_MS) {
            throw new Error(`За ${STEP_WAIT_MS} мс не дождались: ${what}`);
        }
        await new Promise((resolve: (value: unknown) => void): unknown => setTimeout(resolve, 50));
    }
}

/**
 * Отдаёт загрузчику нарисованный файл через его поле выбора — так же, как файл выбирает человек,
 * и ждёт обрезку в поле ненулевой ширины на месте картинки.
 */
async function openCropper({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    const input: HTMLInputElement | null = canvasElement.querySelector('[qa-dataid="image-upload-native"]');
    const view: (Window & typeof globalThis) | null = canvasElement.ownerDocument.defaultView;
    if (input === null || view === null) {
        throw new Error('Поля выбора файла в истории нет');
    }
    const sample: File | null = await drawStoryCropperSample(canvasElement.ownerDocument, view);
    if (sample === null) {
        throw new Error('Демо-картинка не нарисовалась');
    }
    const transfer: DataTransfer = new view.DataTransfer();
    transfer.items.add(sample);
    input.files = transfer.files;
    input.dispatchEvent(new view.Event('change', { bubbles: true }));
    await waitFor('рамка обрезки', (): boolean => canvasElement.querySelector('[qa-dataid="image-cropper-frame"]') !== null);
    const field: HTMLElement | null = canvasElement.querySelector('[qa-dataid="image-cropper-field"]');
    if (field === null || field.clientWidth < 200) {
        throw new Error(`Поле обрезки сжато раскладкой: ширина ${field?.clientWidth ?? 'поля нет'}`);
    }
}

/** Файл выбран: на месте картинки обрезка, под ней «Отмена» и «Применить» */
export const Cropping: TStory = {
    args: { ...Playground.args },
    play: openCropper,
};

/** «Применить»: обрезанная картинка встала на место прежней, обрезки больше нет */
export const Applied: TStory = {
    args: { ...Playground.args },
    play: async (context: { canvasElement: HTMLElement }): Promise<void> => {
        const root: HTMLElement = context.canvasElement;
        await openCropper(context);
        const apply: HTMLButtonElement = root.querySelector('[qa-dataid="image-upload-apply"]') as HTMLButtonElement;
        await waitFor('доступная «Применить»', (): boolean => !apply.disabled);
        apply.click();
        await waitFor('картинка на месте обрезки', (): boolean => {
            const image: HTMLImageElement | null = root.querySelector('[qa-dataid="image-upload-image"]');
            return image !== null && image.complete && image.naturalWidth > 0;
        });
        if (
            root.querySelector('[qa-dataid="image-upload-drop"]') !== null ||
            root.querySelector('[qa-dataid="image-upload-cropper"]') !== null
        ) {
            throw new Error('Рядом с картинкой осталась зона или обрезка');
        }
    },
};
