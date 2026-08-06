import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, hostClasses, qa } from '../../../testing/rt-kit-testing';
import { RtIconButtonComponent } from './rt-icon-button.component';
import { IRtIconButton } from './rt-icon-button.model';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtIconButtonComponent> {
    return createRtFixture(RtIconButtonComponent, { icon: 'ico-trash', ariaLabel: 'Удалить', ...inputs });
}

function control(fixture: ComponentFixture<RtIconButtonComponent>): DebugElement | null {
    return qa(fixture, 'icon-button-control');
}

function controlClasses(fixture: ComponentFixture<RtIconButtonComponent>): string[] {
    return classesOf(control(fixture));
}

describe('RtIconButtonComponent', (): void => {
    it('рисует свою кнопку внутри, а не превращает host в кнопку', (): void => {
        const fixture: ComponentFixture<RtIconButtonComponent> = setup();

        expect(hostClasses(fixture)).toContain('rt-icon-button');
        expect((control(fixture)?.nativeElement as HTMLElement).tagName).toBe('BUTTON');
    });

    it('рисует заданную иконку', (): void => {
        expect(el(setup(), 'use')?.attributes['href']).toBe('#rt-icon-ico-trash');
    });

    describe('оформление', (): void => {
        it('без входов — призрачная кнопка среднего размера квадратной формы', (): void => {
            expect(controlClasses(setup())).toEqual(
                expect.arrayContaining(['rt-icon-button--ghost', 'rt-icon-button--md', 'rt-icon-button--square'])
            );
        });

        it.each<IRtIconButton.Variant>(['primary', 'secondary', 'ghost', 'danger', 'success', 'warning'])(
            'палитра %s выводит свой модификатор',
            (variant: IRtIconButton.Variant): void => {
                expect(controlClasses(setup({ variant }))).toContain(`rt-icon-button--${variant}`);
            }
        );

        it.each<IRtIconButton.Size>(['sm', 'md', 'lg'])('размер %s выводит свой модификатор', (size: IRtIconButton.Size): void => {
            expect(controlClasses(setup({ size }))).toContain(`rt-icon-button--${size}`);
        });

        it.each<IRtIconButton.Shape>(['circle', 'square'])('форма %s выводит свой модификатор', (shape: IRtIconButton.Shape): void => {
            expect(controlClasses(setup({ shape }))).toContain(`rt-icon-button--${shape}`);
        });

        it('камелкейс модификатора превращается в дефис', (): void => {
            expect(controlClasses(setup({ indicator: true }))).toContain('rt-icon-button--has-indicator');
        });
    });

    describe('размер иконки', (): void => {
        it.each<[IRtIconButton.Size, string]>([
            ['sm', '16px'],
            ['md', '20px'],
            ['lg', '24px'],
        ])('размер кнопки %s даёт иконку %s', (size: IRtIconButton.Size, expected: string): void => {
            expect((el(setup({ size }), 'rt-icon')?.nativeElement as HTMLElement).style.width).toBe(expected);
        });

        it('заданный размер иконки перебивает размер кнопки', (): void => {
            // Крупная кнопка-действие: в неё целятся пальцем, а иконка во весь
            // диаметр выглядела бы тяжеловесно.
            const fixture: ComponentFixture<RtIconButtonComponent> = setup({ size: 'lg', iconSize: 'sm' });

            expect((el(fixture, 'rt-icon')?.nativeElement as HTMLElement).style.width).toBe('16px');
        });
    });

    describe('загрузка', (): void => {
        it('подменяет иконку кольцом и блокирует кнопку', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setup({ loading: true });

            expect(el(fixture, '.rt-icon-button__spinner use')?.attributes['href']).toBe('#rt-icon-spinner');
            expect(el(fixture, '.rt-icon-button__icon')).toBeNull();
            expect((control(fixture)?.nativeElement as HTMLButtonElement).disabled).toBe(true);
        });

        it('во время загрузки клик наружу не уходит', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setup({ loading: true });
            const clicks: jest.Mock = jest.fn();
            fixture.componentInstance.clicked.subscribe(clicks);

            control(fixture)?.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(clicks).not.toHaveBeenCalled();
        });
    });

    describe('отключение', (): void => {
        it('отключённая кнопка не поднимает событие даже при вручную посланном клике', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setup({ disabled: true });
            const clicks: jest.Mock = jest.fn();
            fixture.componentInstance.clicked.subscribe(clicks);

            control(fixture)?.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(clicks).not.toHaveBeenCalled();
        });
    });

    it('клик поднимает исходный MouseEvent', (): void => {
        const fixture: ComponentFixture<RtIconButtonComponent> = setup();
        const seen: MouseEvent[] = [];
        fixture.componentInstance.clicked.subscribe((event: MouseEvent): void => {
            seen.push(event);
        });

        control(fixture)?.nativeElement.click();
        fixture.detectChanges();

        expect(seen.length).toBe(1);
        expect(seen[0]).toBeInstanceOf(MouseEvent);
    });

    describe('доступность', (): void => {
        it('подпись обязательна и уезжает в aria-label — текста у кнопки нет', (): void => {
            expect(control(setup({ ariaLabel: 'Закрыть' }))?.attributes['aria-label']).toBe('Закрыть');
        });

        it('нажатое состояние объявляется только когда оно есть', (): void => {
            expect(control(setup())?.attributes['aria-pressed']).toBeUndefined();
            expect(control(setup({ active: true }))?.attributes['aria-pressed']).toBe('true');
        });

        it('вспомогательная кнопка убирается из таб-порядка отрицательным индексом', (): void => {
            expect(control(setup({ tabIndex: -1 }))?.attributes['tabindex']).toBe('-1');
        });

        it('тип кнопки задаётся входом — внутри формы нужен submit', (): void => {
            expect((control(setup({ type: 'submit' }))?.nativeElement as HTMLButtonElement).type).toBe('submit');
        });
    });

    describe('индикатор', (): void => {
        it('без входа точки нет', (): void => {
            expect(el(setup(), '.rt-icon-button__indicator')).toBeNull();
        });

        it('точка спрятана от скринридера — она дублирует то, что уже сказано словами', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setup({ indicator: true });

            expect(el(fixture, '.rt-icon-button__indicator')?.attributes['aria-hidden']).toBe('true');
        });
    });
});
