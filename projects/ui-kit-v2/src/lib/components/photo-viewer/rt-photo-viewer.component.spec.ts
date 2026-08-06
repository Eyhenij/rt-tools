import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { firstValueFrom } from 'rxjs';

import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtDialogRef } from '../dialog/rt-dialog-ref';
import { RtDialogService } from '../dialog/rt-dialog.service';
import { IRtPhotoViewer } from './rt-photo-viewer.model';
import { RtPhotoViewerComponent } from './rt-photo-viewer.component';

function photo(id: number): IRtPhotoViewer.Photo {
    return {
        id,
        alt: `Кадр ${id}`,
        picture: { sources: [], fallbackSrc: `/photo-${id}.jpg`, fallbackSrcset: `/photo-${id}.jpg 1x` },
    } as IRtPhotoViewer.Photo;
}

const PHOTOS: ReadonlyArray<IRtPhotoViewer.Photo> = [photo(1), photo(2), photo(3)];

function open(data: Partial<IRtPhotoViewer.Data> = {}): RtDialogRef<number> {
    TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
    const ref: RtDialogRef<number> = TestBed.inject(RtDialogService).open<RtPhotoViewerComponent, IRtPhotoViewer.Data, number>(
        RtPhotoViewerComponent,
        { data: { photos: PHOTOS, startIndex: 0, ...data } as IRtPhotoViewer.Data }
    );
    TestBed.inject(ApplicationRef).tick();
    return ref;
}

function render(): void {
    TestBed.inject(ApplicationRef).tick();
}

/**
 * Просмотрщик прокручивает ленту к текущему кадру, а в jsdom у элемента нет
 * `scrollTo`. Подставляем заглушку — сама прокрутка здесь не проверяется.
 */
beforeAll((): void => {
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
        configurable: true,
        writable: true,
        value: (): void => undefined,
    });
});

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

function press(id: string): void {
    (document.querySelector(`[qa-dataid="${id}"] [qa-dataid="icon-button-control"]`) as HTMLButtonElement).click();
    render();
}

function counter(): string {
    return (node('photo-viewer-counter')?.textContent ?? '').trim();
}

describe('RtPhotoViewerComponent', (): void => {
    it('открывается на заданном кадре и показывает счётчик', (): void => {
        open({ startIndex: 1 });

        expect(counter()).toBe('2 / 3');
    });

    it('объявлен модальным окном и забирает фокус', (): void => {
        // Клавиши листают кадры, поэтому фокус обязан быть на самом окне,
        // а не остаться на кнопке, которая его открыла.
        open();

        const viewer: HTMLElement | null = document.querySelector('rt-photo-viewer');
        expect(viewer?.getAttribute('role')).toBe('dialog');
        expect(viewer?.getAttribute('aria-modal')).toBe('true');
        expect(viewer?.getAttribute('tabindex')).toBe('-1');
    });

    describe('листание', (): void => {
        it('стрелка вперёд переходит к следующему кадру', (): void => {
            open();

            press('photo-viewer-next');

            expect(counter()).toBe('2 / 3');
        });

        it('с последнего кадра переходит на первый — лента замкнута', (): void => {
            open({ startIndex: 2 });

            press('photo-viewer-next');

            expect(counter()).toBe('1 / 3');
        });

        it('с первого назад — на последний', (): void => {
            open();

            press('photo-viewer-prev');

            expect(counter()).toBe('3 / 3');
        });

        it('клавиши-стрелки листают так же, как кнопки', (): void => {
            open();

            document.querySelector('rt-photo-viewer')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            render();

            expect(counter()).toBe('2 / 3');
        });

        it('у единственного кадра стрелок нет', (): void => {
            open({ photos: [photo(1)] });

            expect(node('photo-viewer-prev')).toBeNull();
            expect(node('photo-viewer-next')).toBeNull();
        });
    });

    describe('отрисовка кадров', (): void => {
        it('рисуются только текущий и соседние — длинная лента разом не грузится', (): void => {
            // Три кадра помещаются в окно целиком; отсечение видно на ленте
            // подлиннее — там дальние кадры остаются пустыми до подхода.
            const many: ReadonlyArray<IRtPhotoViewer.Photo> = Array.from({ length: 10 }, (_: unknown, i: number): IRtPhotoViewer.Photo =>
                photo(i + 1)
            );

            open({ photos: many, startIndex: 0 });

            expect(document.querySelectorAll('[qa-dataid="photo-viewer-image"]').length).toBeLessThan(many.length);
        });

        it('у кадра есть текстовое описание', (): void => {
            open();

            expect((node('photo-viewer-image') as HTMLImageElement | null)?.alt).toBe('Кадр 1');
        });
    });

    describe('закрытие', (): void => {
        it('крестик отдаёт номер кадра, на котором закрыли', (): void => {
            // Список за просмотрщиком прокручивается к тому же кадру.
            const ref: RtDialogRef<number> = open();
            const closed: Promise<number | undefined> = firstValueFrom(ref.afterClosed());
            press('photo-viewer-next');

            press('photo-viewer-close');

            return expect(closed).resolves.toBe(1);
        });

        it('Escape закрывает так же', async (): Promise<void> => {
            const ref: RtDialogRef<number> = open();
            const closed: Promise<number | undefined> = firstValueFrom(ref.afterClosed());

            document.querySelector('rt-photo-viewer')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

            await expect(closed).resolves.toBe(0);
        });
    });

    it('без панели подвала нет — управление кадром приходит снаружи', (): void => {
        open();

        expect(node('photo-viewer-panel')).toBeNull();
    });
});
