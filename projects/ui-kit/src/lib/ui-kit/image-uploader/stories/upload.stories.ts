import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor } from 'storybook/test';

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

/**
 * Тот же рисунок в PNG. Обрезчик открывает файл как картинку и по типу решает, чем её
 * разбирать: байты SVG под именем PNG он не раскрывает, и в кадре остаётся пустая рамка.
 */
const SAMPLE_PNG_BASE64: string =
    'iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAACHElEQVR42u3dsQ3DMBRDQc2W2bJjxrHrlAYkwSJPeBMQV9r44/P9' +
    'SdMbJhBYAktgSWAJLIElgSWwBJYElsASWBJYAktgSWAJLIElgSWwBJYElsASWBJYAktgSWAJLIElgSWwBJYElsASWBJYAktgSWAJ' +
    'LIElgSWw3tf1/BkNrJmeCANrOSm8wFpICq92WNeuBxZSeIF1lKpCW4MqtsA6mFQbr0EVW2CFqGqwBRZYYAWpirc1qGILrDRVwbbA' +
    'AgusRFWptsACC6xQVZG2wAILrFxVebbAAgusaFVhtsACCyywwKKq3BZYYIEFFlhggQUWWGCBBRZYYIEFFlhggQUWWGCBBRZYYIEF' +
    'FlhggQUWWGCBBRZYYPmCFCywwAILLLD8VwgWWGCxRRVYYIHFVokqsMACK9dW5P5ggQVWoq3U8V2moAqsLFvZs4MFFlhBtuI3d2GV' +
    'KrDO59UztSv2VIF1sq22kRthbebVOW8vrA28modth7WIl0nBmszLjGDNFGY0sASWwJLAElgCSwJLYAksCSyBJbAksASWwJLAElgC' +
    'S2BZQWAJLIElgSWwBJYElsASWBJYAktgSWAJLIElgSWwBJYElsASWBJYAktgSWAJLIElgSWwBJYElsASWBJYAktgSWAJLIElgSWw' +
    'BJYElsASWBJYAktgSWAJLIElgSWwBJYElsASWBJYAktgSWAJLIElgSWwBJYElsASWNJfN7zSiwJt72CeAAAAAElFTkSuQmCC';

export const ImageUpload: Story = {
    args: { imageUrl: SAMPLE_IMAGE },
};

/**
 * Обрезка выбранной картинки. Состояние наступает только после выбора файла, поэтому файл
 * подаётся историей: иначе кнопки «Cancel» и «Apply» не показаны ничем.
 *
 * Файл встроен в историю, а не берётся из сети: обрезчик рисует его сам, и внешний
 * источник давал бы каждый раз другой кадр.
 */
export const ImageCropper: Story = {
    args: { imageUrl: SAMPLE_IMAGE },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        const input: HTMLInputElement | null = canvasElement.querySelector('input[type="file"]');

        if (!input) {
            throw new Error('Поля выбора файла в истории нет');
        }

        const response: Response = await fetch(`data:image/png;base64,${SAMPLE_PNG_BASE64}`);
        const bytes: Blob = await response.blob();

        await userEvent.upload(input, new File([bytes], 'sample.png', { type: 'image/png' }));
        await waitFor(() => expect(canvasElement.querySelector('image-cropper img')).toBeTruthy());
    },
};
