import { isImageFile, uploadState } from './rt-image-upload.logic';

describe('rt-image-upload.logic', (): void => {
    describe('uploadState', (): void => {
        it('SC-UKV-411 — исходник важнее картинки, картинка важнее зоны', (): void => {
            expect(uploadState(false, true, 'blob:image')).toBe('cropping');
            expect(uploadState(false, false, 'blob:image')).toBe('image');
            expect(uploadState(false, false, null)).toBe('empty');
        });

        it('SC-UKV-420 — загрузка приложения важнее всего', (): void => {
            expect(uploadState(true, true, 'blob:image')).toBe('loading');
        });

        it('SC-UKV-412 — пустой адрес — это зона загрузки', (): void => {
            expect(uploadState(false, false, '')).toBe('empty');
        });
    });

    describe('isImageFile', (): void => {
        it('SC-UKV-413 — берёт файл изображения и пропускает остальное', (): void => {
            expect(isImageFile(new File(['x'], 'a.png', { type: 'image/png' }))).toBe(true);
            expect(isImageFile(new File(['x'], 'a.pdf', { type: 'application/pdf' }))).toBe(false);
            expect(isImageFile(null)).toBe(false);
            expect(isImageFile(undefined)).toBe(false);
        });
    });
});
