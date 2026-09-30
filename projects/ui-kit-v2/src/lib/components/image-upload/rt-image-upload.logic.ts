import { IRtImageUpload } from './rt-image-upload.model';

/**
 * Какое состояние занимает место. Загрузка приложения важнее всего, выбранный исходник важнее
 * картинки, картинка важнее зоны загрузки.
 */
export function uploadState(loading: boolean, hasSource: boolean, image: string | null): IRtImageUpload.State {
    if (loading) {
        return 'loading';
    }
    if (hasSource) {
        return 'cropping';
    }
    return image ? 'image' : 'empty';
}

/** Берётся только файл изображения: брошенный файл другого типа загрузчик пропускает */
export function isImageFile(file: File | null | undefined): file is File {
    return !!file && file.type.startsWith('image/');
}
