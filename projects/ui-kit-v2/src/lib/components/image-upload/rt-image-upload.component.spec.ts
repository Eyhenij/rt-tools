import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createRtFixture, fileListOf, qa, setInputs } from '../../../testing/rt-kit-testing';
import { RtFileDropComponent } from '../file-drop';
import { IRtImageCropper, RtImageCropperComponent } from '../image-cropper';
import { RtTooltipDirective } from '../tooltip';
import { RtImageUploadComponent } from './rt-image-upload.component';

/**
 * jsdom не декодирует картинок: обрезка внутри загрузчика только поднимается, а её результат тест
 * отдаёт сам — через выход дочернего компонента. Адреса файлов подменены и несут имя файла: так
 * адрес применённого файла отличается от адреса, который обрезка делает под исходник.
 */
class SilentImage {
    public onload: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    public src: string = '';
}

const made: string[] = [];
const released: string[] = [];

const originals: { image: typeof Image; create: typeof URL.createObjectURL; revoke: typeof URL.revokeObjectURL } = {
    image: window.Image,
    create: URL.createObjectURL,
    revoke: URL.revokeObjectURL,
};

beforeAll((): void => {
    Object.defineProperty(window, 'Image', { configurable: true, writable: true, value: SilentImage });
    URL.createObjectURL = (object: Blob | MediaSource): string => {
        const url: string = `blob:${object instanceof File ? object.name : 'blob'}#${made.length + 1}`;
        made.push(url);
        return url;
    };
    URL.revokeObjectURL = (url: string): void => {
        released.push(url);
    };
});

afterAll((): void => {
    Object.defineProperty(window, 'Image', { configurable: true, writable: true, value: originals.image });
    URL.createObjectURL = originals.create;
    URL.revokeObjectURL = originals.revoke;
});

beforeEach((): void => {
    made.length = 0;
    released.length = 0;
});

function image(name: string = 'photo.png', type: string = 'image/png'): File {
    return new File([new Uint8Array(4)], name, { type });
}

interface ISetup {
    readonly fixture: ComponentFixture<RtImageUploadComponent>;
    readonly applied: File[];
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ISetup {
    const applied: File[] = [];
    const fixture: ComponentFixture<RtImageUploadComponent> = createRtFixture(RtImageUploadComponent, inputs);
    fixture.componentInstance.imageChanged.subscribe((file: File): void => {
        applied.push(file);
    });
    return { fixture, applied };
}

function drop(fixture: ComponentFixture<RtImageUploadComponent>, file: File): void {
    const zone: DebugElement = fixture.debugElement.query(By.directive(RtFileDropComponent));
    (zone.componentInstance as RtFileDropComponent).filesDropped.emit([file]);
    fixture.detectChanges();
}

function crop(fixture: ComponentFixture<RtImageUploadComponent>): void {
    const cropper: DebugElement = fixture.debugElement.query(By.directive(RtImageCropperComponent));
    const result: IRtImageCropper.Result = {
        file: new File(['cut'], 'photo.png', { type: 'image/png' }),
        frame: { x: 0, y: 0, width: 10, height: 10 },
    };
    (cropper.componentInstance as RtImageCropperComponent).cropped.emit(result);
    fixture.detectChanges();
}

function srcOf(fixture: ComponentFixture<RtImageUploadComponent>): string | null {
    return (qa(fixture, 'image-upload-image')?.nativeElement as HTMLImageElement | undefined)?.getAttribute('src') ?? null;
}

function press(fixture: ComponentFixture<RtImageUploadComponent>, id: string): void {
    (qa(fixture, id)?.nativeElement as HTMLElement).click();
    fixture.detectChanges();
}

function pickerClicks(fixture: ComponentFixture<RtImageUploadComponent>): jest.SpyInstance {
    return jest
        .spyOn(qa(fixture, 'image-upload-native')?.nativeElement as HTMLInputElement, 'click')
        .mockImplementation((): void => undefined);
}

describe('RtImageUploadComponent', (): void => {
    it('SC-UKV-412 — без картинки и исходника место — зона загрузки с кнопкой', (): void => {
        const { fixture } = setup();

        expect(qa(fixture, 'image-upload-drop')).not.toBeNull();
        expect(qa(fixture, 'image-upload-choose')).not.toBeNull();
        expect(qa(fixture, 'image-upload-image')).toBeNull();
    });

    it('SC-UKV-413 — брошенное изображение открывает обрезку, файл другого типа — нет', (): void => {
        const { fixture } = setup();

        drop(fixture, new File(['x'], 'a.pdf', { type: 'application/pdf' }));
        expect(qa(fixture, 'image-upload-cropper')).toBeNull();

        drop(fixture, image());
        expect(qa(fixture, 'image-upload-cropper')).not.toBeNull();
        expect(qa(fixture, 'image-upload-drop')).toBeNull();
    });

    it('SC-UKV-413 — файл, выбранный кнопкой, открывает обрезку', (): void => {
        const { fixture } = setup();
        const input: HTMLInputElement = qa(fixture, 'image-upload-native')?.nativeElement as HTMLInputElement;
        Object.defineProperty(input, 'files', { configurable: true, value: fileListOf([image()]) });

        input.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        expect(qa(fixture, 'image-upload-cropper')).not.toBeNull();
    });

    it('SC-UKV-411 — при картинке и исходнике видна только обрезка', (): void => {
        const { fixture } = setup({ imageUrl: 'https://example.test/logo.png' });

        drop(fixture, image());

        expect(qa(fixture, 'image-upload-cropper')).not.toBeNull();
        expect(qa(fixture, 'image-upload-image')).toBeNull();
        expect(qa(fixture, 'image-upload-drop')).toBeNull();
    });

    it('SC-UKV-414 — «Применить» ставит результат на место и отдаёт файл приложению', (): void => {
        const { fixture, applied } = setup({ fileName: 'logo.png' });
        drop(fixture, image());
        crop(fixture);

        press(fixture, 'image-upload-apply');

        const url: string | null = srcOf(fixture);
        expect(applied.map((file: File): string => file.name)).toEqual(['logo.png']);
        expect(qa(fixture, 'image-upload-cropper')).toBeNull();
        expect(url).toMatch(/^blob:logo\.png#/);
        expect(url).toBe(srcOf(fixture));
    });

    it('SC-UKV-414 — новый применённый файл отпускает адрес прежнего', (): void => {
        const { fixture } = setup({ fileName: 'logo.png' });
        drop(fixture, image());
        crop(fixture);
        press(fixture, 'image-upload-apply');
        const first: string | null = srcOf(fixture);
        drop(fixture, image());
        crop(fixture);

        press(fixture, 'image-upload-apply');

        expect(released.filter((url: string): boolean => url.startsWith('blob:logo.png'))).toEqual([first]);
        expect(srcOf(fixture)).not.toBe(first);
    });

    it('SC-UKV-414 — «Применить» недоступна, пока обрезка не отдала результат', (): void => {
        const { fixture } = setup();
        drop(fixture, image());

        expect((qa(fixture, 'image-upload-apply')?.nativeElement as HTMLButtonElement).disabled).toBe(true);
    });

    it('SC-UKV-415 — «Отмена» возвращает прежнюю картинку и ничего не отдаёт', (): void => {
        const { fixture, applied } = setup({ imageUrl: 'https://example.test/logo.png' });
        drop(fixture, image());
        crop(fixture);

        press(fixture, 'image-upload-cancel');

        expect(applied).toEqual([]);
        expect((qa(fixture, 'image-upload-image')?.nativeElement as HTMLImageElement).getAttribute('src')).toBe(
            'https://example.test/logo.png'
        );
    });

    it('SC-UKV-416 — при автоприменении кнопок нет, и каждый результат уходит сразу', (): void => {
        const { fixture, applied } = setup({ autoApply: true });
        drop(fixture, image());

        expect(qa(fixture, 'image-upload-apply')).toBeNull();
        crop(fixture);
        crop(fixture);

        expect(applied.length).toBe(2);
        const own: string[] = made.filter((url: string): boolean => url.startsWith('blob:image#'));
        expect(qa(fixture, 'image-upload-cropper')).not.toBeNull();
        expect(own.length).toBe(2);
        expect(released).toContain(own[0]);
    });

    it('SC-UKV-417 — нажатие и Enter на картинке открывают выбор файла', (): void => {
        const { fixture } = setup({ imageUrl: 'https://example.test/logo.png' });
        const clicks: jest.SpyInstance = pickerClicks(fixture);
        const img: HTMLElement = qa(fixture, 'image-upload-image')?.nativeElement as HTMLElement;

        img.click();
        img.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        img.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

        expect(clicks).toHaveBeenCalledTimes(3);
        expect(img.getAttribute('role')).toBe('button');
    });

    it('SC-UKV-418 — скачивание сохраняет картинку под именем файла', (): void => {
        const { fixture } = setup({ imageUrl: 'https://example.test/logo.png', downloadable: true, fileName: 'logo.png' });
        const links: HTMLAnchorElement[] = [];
        const click: jest.SpyInstance = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
            this: HTMLAnchorElement
        ): void {
            links.push(this);
        });
        let downloads: number = 0;
        fixture.componentInstance.downloaded.subscribe((): void => {
            downloads++;
        });

        press(fixture, 'image-upload-download');

        expect(links.map((link: HTMLAnchorElement): string => `${link.download} ${link.href}`)).toEqual([
            'logo.png https://example.test/logo.png',
        ]);
        expect(downloads).toBe(1);
        click.mockRestore();
    });

    it('SC-UKV-414 — новый адрес от приложения берёт верх над применённым', (): void => {
        const { fixture } = setup();
        drop(fixture, image());
        crop(fixture);
        press(fixture, 'image-upload-apply');

        setInputs(fixture, { imageUrl: 'https://example.test/saved.png' });
        fixture.detectChanges();

        expect(srcOf(fixture)).toBe('https://example.test/saved.png');
    });

    it('SC-UKV-418 — без просьбы приложения кнопки скачивания нет', (): void => {
        const { fixture } = setup({ imageUrl: 'https://example.test/logo.png' });

        expect(qa(fixture, 'image-upload-download')).toBeNull();
    });

    it('SC-UKV-419 — недоступный загрузчик не открывает выбор и не берёт файлов', (): void => {
        const { fixture } = setup({ imageUrl: 'https://example.test/logo.png', disabled: true });
        const clicks: jest.SpyInstance = pickerClicks(fixture);

        (qa(fixture, 'image-upload-image')?.nativeElement as HTMLElement).click();
        fixture.componentInstance.choose(image());
        fixture.detectChanges();

        expect(clicks).not.toHaveBeenCalled();
        expect(qa(fixture, 'image-upload-cropper')).toBeNull();
    });

    it('SC-UKV-420 — пока приложение загружает, на месте индикатор', (): void => {
        const { fixture } = setup({ imageUrl: 'https://example.test/logo.png', loading: true });

        expect(qa(fixture, 'image-upload-loading')).not.toBeNull();
        expect(qa(fixture, 'image-upload-image')).toBeNull();
    });

    it('SC-UKV-421 — тексты — подписи кита, а подсказка приложения заменяет свою', (): void => {
        const { fixture } = setup({ imageUrl: 'https://example.test/logo.png' });
        const tooltip: () => string = (): string =>
            fixture.debugElement.query(By.directive(RtTooltipDirective)).injector.get(RtTooltipDirective).text();

        expect(tooltip()).toBe('Click to change the image');

        setInputs(fixture, { tooltip: 'Логотип. Нажмите, чтобы заменить' });
        fixture.detectChanges();
        expect(tooltip()).toBe('Логотип. Нажмите, чтобы заменить');

        setInputs(fixture, { imageUrl: null });
        fixture.detectChanges();
        expect((qa(fixture, 'image-upload-choose')?.nativeElement as HTMLElement).getAttribute('aria-label')).toBe('Choose file');
    });
});
