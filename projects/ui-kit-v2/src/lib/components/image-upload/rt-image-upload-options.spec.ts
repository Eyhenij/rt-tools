import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createRtFixture, qa, setInputs } from '../../../testing/rt-kit-testing';
import { RtButtonDirective } from '../button';
import { RtIconComponent } from '../icon';
import { RtImageUploadComponent } from './rt-image-upload.component';

/** Стили компонента спековое преобразование вырезает: правила читаются из исходника. */
const STYLES: string = readFileSync(join(__dirname, 'rt-image-upload.component.scss'), 'utf8');

/** Ступени значка в пикселях: `xs` — 12, `md` — 20; значок хранит размер пикселями. */
const XS_PX: number = 12;
const MD_PX: number = 20;

const PICTURE: Readonly<Record<string, unknown>> = { imageUrl: 'https://example.test/logo.png', downloadable: true };

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtImageUploadComponent> {
    return createRtFixture(RtImageUploadComponent, inputs);
}

function downloadIconSize(fixture: ComponentFixture<RtImageUploadComponent>): number | undefined {
    const icon: DebugElement | undefined = qa(fixture, 'image-upload-download')?.query(By.directive(RtIconComponent));

    return (icon?.componentInstance as RtIconComponent | undefined)?.size();
}

function choose(fixture: ComponentFixture<RtImageUploadComponent>): { readonly node: HTMLElement; readonly button: RtButtonDirective } {
    const node: DebugElement | null = qa(fixture, 'image-upload-choose');
    if (node === null) {
        throw new Error('the choose button is not drawn');
    }

    return { node: node.nativeElement as HTMLElement, button: node.injector.get(RtButtonDirective) };
}

/** Тело правила элемента: от его селектора до первой закрывающей скобки. */
function rule(selector: string): string {
    const start: number = STYLES.indexOf(selector);
    expect(start).toBeGreaterThan(-1);

    return STYLES.slice(start, STYLES.indexOf('}', start));
}

describe('RtImageUploadComponent — download button, choose button and preview', (): void => {
    it('SC-UKV-631 — the download button takes its size from the uploader property', (): void => {
        expect(STYLES).toContain('--rt-image-upload-download-size: var(--rt-control-height-md);');
        expect(rule('&.rt-icon-button {')).toContain('--rt-icon-button-size-step: var(--rt-image-upload-download-size);');
        expect(STYLES).not.toMatch(/--rt-icon-button-size\s*:/);
    });

    it('SC-UKV-632 — the download icon takes its size from the input, and the button step without it', (): void => {
        const fixture: ComponentFixture<RtImageUploadComponent> = setup({ ...PICTURE, downloadIconSize: 'xs' });

        expect(downloadIconSize(fixture)).toBe(XS_PX);

        setInputs(fixture, { downloadIconSize: null });
        fixture.detectChanges();

        expect(downloadIconSize(fixture)).toBe(MD_PX);
    });

    it('SC-UKV-633 — the blur under the download button comes from the property', (): void => {
        const download: string = rule('&__download {');

        expect(STYLES).toContain('--rt-image-upload-download-blur: 8px;');
        expect(download).toContain('-webkit-backdrop-filter: blur(var(--rt-image-upload-download-blur));');
        expect(download).toContain(' backdrop-filter: blur(var(--rt-image-upload-download-blur));');
        expect(download).not.toContain('blur(8px)');
    });

    it('SC-UKV-634 — the choose button takes its look and icon from the inputs', (): void => {
        const fixture: ComponentFixture<RtImageUploadComponent> = setup({ chooseAppearance: 'text', chooseIcon: 'ico-image' });

        expect(choose(fixture).node.classList).toContain('rt-button--text');
        expect(choose(fixture).node.classList).not.toContain('rt-button--outlined');
        expect(choose(fixture).button.icon()).toBe('ico-image');

        setInputs(fixture, { chooseIcon: null });
        fixture.detectChanges();

        expect(choose(fixture).button.icon()).toBeNull();
    });

    it('SC-UKV-635 — the preview stands on the top of its line', (): void => {
        expect(rule('&__preview {')).toContain('vertical-align: top;');
    });

    it('SC-UKV-636 — without the new values the uploader draws as before', (): void => {
        const empty: ComponentFixture<RtImageUploadComponent> = setup();

        expect(choose(empty).node.classList).toContain('rt-button--outlined');
        expect(choose(empty).button.icon()).toBe('ico-upload');
    });

    it('SC-UKV-636 — without the new values the download icon follows the button size', (): void => {
        expect(downloadIconSize(setup(PICTURE))).toBe(MD_PX);
    });
});
