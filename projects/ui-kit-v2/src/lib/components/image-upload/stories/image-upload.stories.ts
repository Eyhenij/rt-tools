import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtImageUploadComponent } from './component/test-image-upload.component';

export default {
    title: 'Organisms/ImageUpload',
    component: TestRtImageUploadComponent,
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
 * Сценарий работы: бросить изображение на зону или выбрать кнопкой, обрезать, применить — картинка
 * встаёт на место зоны; нажатие на неё выбирает другой файл.
 */
export const Playground: TStory = {
    parameters: storySnapshotSkip('сценарий работы с выбором файла — кадры семьи снимают её матрица и истории с жестом'),
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

function button(root: HTMLElement, label: string): HTMLButtonElement {
    const found: HTMLButtonElement | null = root.querySelector(`button[aria-label="${label}"]`);
    if (found === null) {
        throw new Error(`Кнопки «${label}» в истории нет`);
    }
    return found;
}

/** Бросает демо-картинку и ждёт обрезку в поле ненулевой ширины на месте зоны */
async function openCropper({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    button(canvasElement, 'Бросить демо-картинку').click();
    await waitFor('рамка обрезки', (): boolean => canvasElement.querySelector('[qa-dataid="image-cropper-frame"]') !== null);
    const field: HTMLElement | null = canvasElement.querySelector('[qa-dataid="image-cropper-field"]');
    if (field === null || field.clientWidth < 200) {
        throw new Error(`Поле обрезки сжато раскладкой: ширина ${field?.clientWidth ?? 'поля нет'}`);
    }
    if (canvasElement.querySelector('[qa-dataid="image-upload-drop"]') !== null) {
        throw new Error('Зона загрузки осталась рядом с обрезкой');
    }
}

/** Файл брошен: на месте зоны обрезка, под ней «Отмена» и «Применить» */
export const Cropping: TStory = {
    args: { ...Playground.args },
    play: openCropper,
};

/** «Применить»: картинка встала на место зоны, зоны больше нет */
export const Applied: TStory = {
    args: { ...Playground.args },
    play: async (context: { canvasElement: HTMLElement }): Promise<void> => {
        const root: HTMLElement = context.canvasElement;
        await openCropper(context);
        const apply: HTMLButtonElement = root.querySelector('[qa-dataid="image-upload-apply"]') as HTMLButtonElement;
        await waitFor('доступная «Применить»', (): boolean => !apply.disabled);
        apply.click();
        await waitFor('картинка на месте зоны', (): boolean => {
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
