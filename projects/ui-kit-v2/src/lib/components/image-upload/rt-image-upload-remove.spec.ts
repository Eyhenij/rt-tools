import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createRtFixture, qa, setInputs } from '../../../testing/rt-kit-testing';
import { RtIconButtonComponent } from '../icon-button';
import { RtRadiusDirective } from '../radius/rt-radius.directive';
import { RtImageUploadComponent } from './rt-image-upload.component';
import { IRtImageUpload } from './rt-image-upload.model';

/** Стили компонента спековое преобразование вырезает: правила читаются из исходника. */
const STYLES: string = readFileSync(join(__dirname, 'rt-image-upload.component.scss'), 'utf8');

const PICTURE_URL: string = 'https://example.test/photo.png';
const PICTURE: Readonly<Record<string, unknown>> = { imageUrl: PICTURE_URL };
const BOTH: Readonly<Record<string, unknown>> = { ...PICTURE, removable: true, downloadable: true };

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtImageUploadComponent> {
    return createRtFixture(RtImageUploadComponent, inputs);
}

function classesOf(fixture: ComponentFixture<RtImageUploadComponent>, id: string): string[] {
    const node: DebugElement | null = qa(fixture, id);
    if (node === null) {
        throw new Error(`${id} is not drawn`);
    }

    return Array.from((node.nativeElement as HTMLElement).classList);
}

function buttonsRow(fixture: ComponentFixture<RtImageUploadComponent>): HTMLElement {
    const row: HTMLElement | null = (fixture.nativeElement as HTMLElement).querySelector('.rt-image-upload__buttons');
    if (row === null) {
        throw new Error('the row of buttons is not drawn');
    }

    return row;
}

/** Тело правила: от его селектора до первой закрывающей скобки. */
function rule(selector: string): string {
    const start: number = STYLES.indexOf(selector);
    expect(start).toBeGreaterThan(-1);

    return STYLES.slice(start, STYLES.indexOf('}', start));
}

describe('RtImageUploadComponent — remove button and the place of the buttons', (): void => {
    it('SC-UKV-1256 — without the input there is no remove button', (): void => {
        const fixture: ComponentFixture<RtImageUploadComponent> = setup(PICTURE);

        expect(qa(fixture, 'image-upload-image')).not.toBeNull();
        expect(qa(fixture, 'image-upload-remove')).toBeNull();
        expect((fixture.nativeElement as HTMLElement).querySelector('.rt-image-upload__buttons')).toBeNull();
    });

    it('SC-UKV-1257 — with the input on, the picture gets a remove button with the kit label', (): void => {
        const fixture: ComponentFixture<RtImageUploadComponent> = setup({ ...PICTURE, removable: true });
        const button: RtIconButtonComponent | undefined = qa(fixture, 'image-upload-remove')?.componentInstance as
            RtIconButtonComponent | undefined;

        expect(button?.icon()).toBe('ico-close');
        expect(button?.ariaLabel()).toBe('Delete');
    });

    it('SC-UKV-1258 — a press on the remove button tells the application and keeps the picture', (): void => {
        const fixture: ComponentFixture<RtImageUploadComponent> = setup({ ...PICTURE, removable: true });
        const picker: HTMLInputElement = qa(fixture, 'image-upload-native')?.nativeElement as HTMLInputElement;
        const picks: jest.SpyInstance = jest.spyOn(picker, 'click').mockImplementation((): void => undefined);
        let removals: number = 0;
        fixture.componentInstance.removed.subscribe((): void => {
            removals++;
        });

        (qa(fixture, 'image-upload-remove')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(removals).toBe(1);
        expect((qa(fixture, 'image-upload-image')?.nativeElement as HTMLImageElement).getAttribute('src')).toBe(PICTURE_URL);
        expect(picks).not.toHaveBeenCalled();
    });

    it('SC-UKV-1259 — an unavailable uploader shows no remove button', (): void => {
        const fixture: ComponentFixture<RtImageUploadComponent> = setup({ ...PICTURE, removable: true, disabled: true });

        expect(qa(fixture, 'image-upload-image')).not.toBeNull();
        expect(qa(fixture, 'image-upload-remove')).toBeNull();
    });

    it('SC-UKV-1260 — the remove button is hidden until the pointer or the focus, and shown on touch', (): void => {
        const shown: string = rule('&__preview:hover &__remove,');

        expect(STYLES).toMatch(/&__remove \{\s+opacity: 0;\s+@media \(hover: none\) \{\s+opacity: 1;/);
        expect(shown).toContain('&__preview:focus-within &__remove {');
        expect(shown).toContain('opacity: 1;');
    });

    it('SC-UKV-1261 — the buttons stand at the named corner, the top right one by default', (): void => {
        const fixture: ComponentFixture<RtImageUploadComponent> = setup(BOTH);
        const corners: IRtImageUpload.ButtonsCorner[] = ['top-left', 'bottom-right', 'bottom-left'];

        expect(buttonsRow(fixture).classList).toContain('rt-image-upload__buttons--top-right');

        for (const corner of corners) {
            setInputs(fixture, { buttonsCorner: corner });
            fixture.detectChanges();

            expect(buttonsRow(fixture).classList).toContain(`rt-image-upload__buttons--${corner}`);
            expect(buttonsRow(fixture).classList).not.toContain('rt-image-upload__buttons--top-right');
        }
    });

    it('SC-UKV-1262 — the look input puts the buttons inside the picture', (): void => {
        const fixture: ComponentFixture<RtImageUploadComponent> = setup(BOTH);

        expect(buttonsRow(fixture).classList).not.toContain('rt-image-upload__buttons--inside');

        setInputs(fixture, { buttonsPlacement: 'inside' });
        fixture.detectChanges();

        expect(buttonsRow(fixture).classList).toContain('rt-image-upload__buttons--inside');
        expect(rule('&--inside {')).toContain('margin: calc(var(--rt-image-upload-download-overhang) + var(--rt-space-sm));');
    });

    it('SC-UKV-1263 — the remove button stands at the corner itself, the download button next to it', (): void => {
        const fixture: ComponentFixture<RtImageUploadComponent> = setup(BOTH);
        const order: (string | null)[] = Array.from(buttonsRow(fixture).children).map((node: Element): string | null =>
            node.getAttribute('qa-dataid')
        );

        expect(order).toEqual(['image-upload-remove', 'image-upload-download']);
        expect(rule('&--top-right {')).toContain('flex-direction: row-reverse;');
        expect(rule('&--bottom-right {')).toContain('flex-direction: row-reverse;');
        expect(rule('&--top-left {')).not.toContain('flex-direction');
        expect(rule('&--bottom-left {')).not.toContain('flex-direction');
    });

    it('SC-UKV-1264 — the remove button shares the size, the shape and the backing of the download button', (): void => {
        const fixture: ComponentFixture<RtImageUploadComponent> = setup(BOTH);

        expect(classesOf(fixture, 'image-upload-remove')).toContain('rt-image-upload__remove--round');
        expect(classesOf(fixture, 'image-upload-download')).toContain('rt-image-upload__download--round');
        expect(qa(fixture, 'image-upload-remove')?.injector.get(RtRadiusDirective).step()).toBe('full');
        expect(STYLES).toMatch(/&__remove,\s+&__download \{\s+border-radius: var\(--rt-image-upload-download-radius\);/);

        setInputs(fixture, { downloadShape: 'square' });
        fixture.detectChanges();

        expect(classesOf(fixture, 'image-upload-remove')).not.toContain('rt-image-upload__remove--round');
        expect(qa(fixture, 'image-upload-remove')?.injector.get(RtRadiusDirective).step()).toBeNull();
    });
});
