import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtDownloadLinkComponent } from './rt-download-link.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtDownloadLinkComponent> {
    return createRtFixture(RtDownloadLinkComponent, { label: 'Договор.pdf', ...inputs });
}

describe('RtDownloadLinkComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-download-link');
    });

    it('рисует подпись файла', (): void => {
        expect(textOf(qa(setup({ label: 'Акт.docx' }), 'download-link-label'))).toBe('Акт.docx');
    });

    it('рисует иконку загрузки', (): void => {
        expect(el(setup(), 'use')?.attributes['href']).toBe('#rt-icon-ico-download');
    });

    it('это кнопка, а не ссылка — адреса компонент не знает, скачивание запускает потребитель', (): void => {
        const control: HTMLButtonElement = qa(setup(), 'download-link-button')?.nativeElement as HTMLButtonElement;

        expect(control.tagName).toBe('BUTTON');
        expect(control.type).toBe('button');
    });

    it('клик поднимает событие ровно один раз', (): void => {
        const fixture: ComponentFixture<RtDownloadLinkComponent> = setup();
        const clicks: jest.Mock = jest.fn();
        fixture.componentInstance.downloadClick.subscribe(clicks);

        qa(fixture, 'download-link-button')?.nativeElement.click();
        fixture.detectChanges();

        expect(clicks).toHaveBeenCalledTimes(1);
    });

    describe('доступность', (): void => {
        it('подпись для скринридера собирается из переведённой формулировки и имени файла', (): void => {
            const fixture: ComponentFixture<RtDownloadLinkComponent> = setup({ label: 'Договор.pdf' });

            expect(qa(fixture, 'download-link-button')?.attributes['aria-label']).toBe('Download: Договор.pdf');
        });

        it('смена имени файла перерисовывает и подпись для скринридера', (): void => {
            const fixture: ComponentFixture<RtDownloadLinkComponent> = setup({ label: 'Акт.docx' });

            expect(qa(fixture, 'download-link-button')?.attributes['aria-label']).toBe('Download: Акт.docx');
        });
    });
});
