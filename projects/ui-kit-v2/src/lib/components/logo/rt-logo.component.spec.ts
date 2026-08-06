import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa } from '../../../testing/rt-kit-testing';
import { RtLogoComponent } from './rt-logo.component';
import { IRtLogo } from './rt-logo.model';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtLogoComponent> {
    return createRtFixture(RtLogoComponent, inputs);
}

function box(fixture: ComponentFixture<RtLogoComponent>): { width: string; height: string } {
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    return { width: host.style.width, height: host.style.height };
}

describe('RtLogoComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-logo');
    });

    describe('вариант', (): void => {
        it('без входа рисуется композиция со слоганом', (): void => {
            expect(qa(setup(), 'logo-tagline')).not.toBeNull();
        });

        it('одно начертание рисуется без слогана', (): void => {
            expect(qa(setup({ variant: 'wordmark' }), 'logo-tagline')).toBeNull();
        });

        it.each<IRtLogo.Variant>(['wordmark', 'lockup'])('начертание есть в варианте %s', (variant: IRtLogo.Variant): void => {
            expect(qa(setup({ variant }), 'logo-wordmark')).not.toBeNull();
        });
    });

    describe('размер', (): void => {
        it.each<[IRtLogo.Variant, string, string]>([
            ['wordmark', '51px', '275px'],
            ['lockup', '75px', '270px'],
        ])('вариант %s без входов занимает %s в высоту', (variant: IRtLogo.Variant, height: string, width: string): void => {
            expect(box(setup({ variant }))).toEqual({ height, width });
        });

        it('заданная высота растягивает ширину по пропорции варианта', (): void => {
            expect(box(setup({ variant: 'wordmark', height: 100 }))).toEqual({ height: '100px', width: '540px' });
        });

        it('нулевая высота означает «умолчание варианта», а не нулевой размер', (): void => {
            // Ноль здесь — не размер, а признак отсутствия входа: числовой вход
            // не отличает «не задано» от нуля иначе.
            expect(box(setup({ variant: 'wordmark', height: 0 }))).toEqual({ height: '51px', width: '275px' });
        });

        it('заданная пропорция перебивает умолчание варианта', (): void => {
            expect(box(setup({ variant: 'wordmark', height: 50, aspect: 2 }))).toEqual({ height: '50px', width: '100px' });
        });

        it('ширина округляется до целого пикселя', (): void => {
            expect(box(setup({ height: 33, aspect: 3.6 })).width).toBe('119px');
        });

        it('строки принимаются — так значение приходит из атрибута разметки', (): void => {
            expect(box(setup({ variant: 'wordmark', height: '80', aspect: '2' }))).toEqual({ height: '80px', width: '160px' });
        });
    });

    describe('доступность', (): void => {
        it('объявлен изображением', (): void => {
            expect((setup().nativeElement as HTMLElement).getAttribute('role')).toBe('img');
        });

        it('подпись для скринридера задаётся приложением — кит названия продукта не знает', (): void => {
            const host: HTMLElement = setup({ ariaLabel: 'Панель управления' }).nativeElement as HTMLElement;

            expect(host.getAttribute('aria-label')).toBe('Панель управления');
        });
    });

    it('сами начертания не везёт — рисует пустые элементы под фон приложения', (): void => {
        // Файлы даёт приложение свойствами `--rt-logo-*`; без них компонент
        // занимает место и не рисует ничего — это ожидаемое состояние, а не сбой.
        expect(qa(setup(), 'logo-wordmark')?.nativeElement.childNodes.length).toBe(0);
    });
});
