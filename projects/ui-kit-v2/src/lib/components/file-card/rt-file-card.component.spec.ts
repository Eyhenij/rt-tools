import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { IRtFileCard } from './rt-file-card.model';
import { RtFileCardComponent } from './rt-file-card.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtFileCardComponent> {
    return createRtFixture(RtFileCardComponent, { name: 'Договор.pdf', ...inputs });
}

function iconHref(fixture: ComponentFixture<RtFileCardComponent>): string | undefined {
    return el(fixture, '.rt-file-card__icon use')?.attributes['href'];
}

function press(fixture: ComponentFixture<RtFileCardComponent>, id: string): void {
    el(fixture, `[qa-dataid="${id}"] [qa-dataid="icon-button-control"]`)?.nativeElement.click();
    fixture.detectChanges();
}

describe('RtFileCardComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-file-card');
    });

    describe('имя файла', (): void => {
        it('рисуется как есть', (): void => {
            expect(textOf(qa(setup({ name: 'Акт.docx' }), 'file-card-name'))).toBe('Акт.docx');
        });

        it('длинное имя обрезается в середине, чтобы расширение осталось видно', (): void => {
            const long: string = `${'очень-длинное-имя-файла'.repeat(2)}.pdf`;

            const shown: string = textOf(qa(setup({ name: long }), 'file-card-name'));

            expect(shown).toContain('...');
            expect(shown.endsWith('pdf')).toBe(true);
        });

        it('заголовок собирается из имени без расширения и разделителей', (): void => {
            expect(textOf(qa(setup({ name: 'договор_аренды-2026.pdf' }), 'file-card-title'))).toBe('договор аренды 2026');
        });
    });

    describe('иконка типа', (): void => {
        it.each<[string, string]>([
            ['Договор.pdf', '#rt-icon-attach-pdf'],
            ['Акт.docx', '#rt-icon-attach-docx-doc'],
            ['Смета.xlsx', '#rt-icon-attach-xlsx-xls'],
            ['Фото.png', '#rt-icon-attach-jpg-png'],
            ['Архив.zip', '#rt-icon-attach-zip-rar'],
        ])('для %s подставляется своя иконка', (name: string, href: string): void => {
            expect(iconHref(setup({ name }))).toBe(href);
        });

        it('незнакомое расширение получает общую иконку', (): void => {
            expect(iconHref(setup({ name: 'дамп.bin' }))).toBe('#rt-icon-attach-other');
        });

        it('файл без расширения тоже получает общую иконку', (): void => {
            expect(iconHref(setup({ name: 'README' }))).toBe('#rt-icon-attach-other');
        });
    });

    describe('размер файла', (): void => {
        it('без входа строка размера не рисуется', (): void => {
            expect(qa(setup(), 'file-card-size')).toBeNull();
        });

        it('переданный размер рисуется человекочитаемо', (): void => {
            expect(textOf(qa(setup({ sizeBytes: 2048 }), 'file-card-size')).length).toBeGreaterThan(0);
        });
    });

    describe('действия', (): void => {
        it('без входов ни одной кнопки нет — карточка бывает просто вложением', (): void => {
            const fixture: ComponentFixture<RtFileCardComponent> = setup();

            expect(qa(fixture, 'file-card-download')).toBeNull();
            expect(qa(fixture, 'file-card-rename')).toBeNull();
            expect(qa(fixture, 'file-card-remove')).toBeNull();
        });

        it.each<[string, string, keyof RtFileCardComponent]>([
            ['скачивание', 'showDownload', 'download'],
            ['переименование', 'showRename', 'rename'],
            ['удаление', 'showRemove', 'removed'],
        ])(
            '%s включается своим входом и поднимает своё событие',
            (_name: string, flag: string, output: keyof RtFileCardComponent): void => {
                const fixture: ComponentFixture<RtFileCardComponent> = setup({ [flag]: true });
                const seen: jest.Mock = jest.fn();
                (fixture.componentInstance[output] as unknown as { subscribe(fn: () => void): void }).subscribe(seen);

                press(fixture, `file-card-${flag === 'showDownload' ? 'download' : flag === 'showRename' ? 'rename' : 'remove'}`);

                expect(seen).toHaveBeenCalledTimes(1);
            }
        );

        it('отключённая карточка блокирует все кнопки', (): void => {
            const fixture: ComponentFixture<RtFileCardComponent> = setup({
                showDownload: true,
                showRename: true,
                showRemove: true,
                disabled: true,
            });

            const buttons: HTMLButtonElement[] = Array.from(
                (fixture.nativeElement as HTMLElement).querySelectorAll('[qa-dataid="icon-button-control"]')
            );
            expect(buttons.length).toBe(3);
            expect(buttons.every((node: HTMLButtonElement): boolean => node.disabled)).toBe(true);
        });
    });

    describe('размер карточки', (): void => {
        it.each<IRtFileCard.Size>(['sm', 'md', 'lg'])('размер %s помечает host', (size: IRtFileCard.Size): void => {
            expect(hostClasses(setup({ size }))).toContain(`rt-file-card--${size}`);
        });

        it('мелкая карточка рисует мелкую иконку, средняя и крупная — большую', (): void => {
            expect((el(setup({ size: 'sm' }), '.rt-file-card__icon')?.nativeElement as HTMLElement).style.width).toBe('16px');
            expect((el(setup({ size: 'lg' }), '.rt-file-card__icon')?.nativeElement as HTMLElement).style.width).toBe('32px');
        });
    });
});
