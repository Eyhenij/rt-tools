import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, hostClasses, setInputs } from '../../../testing/rt-kit-testing';
import { RtIconComponent } from './rt-icon.component';
import { IRtIcon } from './rt-icon.model';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtIconComponent> {
    return createRtFixture(RtIconComponent, { name: 'check', ...inputs });
}

function hostStyle(fixture: ComponentFixture<RtIconComponent>, property: string): string {
    return (fixture.nativeElement as HTMLElement).style.getPropertyValue(property);
}

describe('RtIconComponent', (): void => {
    it('рисует ссылку на symbol спрайта по имени иконки', (): void => {
        const fixture: ComponentFixture<RtIconComponent> = setup({ name: 'spinner' });

        expect(el(fixture, 'use')?.attributes['href']).toBe('#rt-icon-spinner');
    });

    it('несёт свой BEM-блок на host-элементе', (): void => {
        expect(hostClasses(setup())).toContain('rt-icon');
    });

    describe('размер', (): void => {
        it('без входа рисуется размером md — 20px', (): void => {
            const fixture: ComponentFixture<RtIconComponent> = setup();

            expect(hostStyle(fixture, 'width')).toBe('20px');
            expect(hostStyle(fixture, 'height')).toBe('20px');
        });

        it.each<[IRtIcon.Size, string]>([
            ['xs', '12px'],
            ['sm', '16px'],
            ['md', '20px'],
            ['lg', '24px'],
            ['xl', '32px'],
        ])('размер %s даёт квадрат %s', (size: IRtIcon.Size, expected: string): void => {
            const fixture: ComponentFixture<RtIconComponent> = setup({ size });

            expect(hostStyle(fixture, 'width')).toBe(expected);
            expect(hostStyle(fixture, 'height')).toBe(expected);
        });
    });

    describe('цвет', (): void => {
        it('без входа наследует цвет текста', (): void => {
            // jsdom приводит ключевые слова CSS к нижнему регистру — сравнение
            // без учёта регистра, иначе проверка ловила бы поведение jsdom.
            expect(hostStyle(setup(), 'color').toLowerCase()).toBe('currentcolor');
        });

        it.each<[IRtIcon.Color, string]>([
            ['muted', 'var(--rt-neutral-600)'],
            ['info', 'var(--rt-color-state-info)'],
            ['success', 'var(--rt-color-state-success)'],
            ['warning', 'var(--rt-color-state-warning)'],
            ['danger', 'var(--rt-color-state-danger)'],
            ['inverse', 'var(--rt-color-text-inverse)'],
        ])('цвет %s разрешается в токен %s', (color: IRtIcon.Color, expected: string): void => {
            expect(hostStyle(setup({ color }), 'color')).toBe(expected);
        });
    });

    describe('поворот', (): void => {
        it('без входа поворота нет', (): void => {
            expect(hostStyle(setup(), 'transform')).toBe('');
        });

        it('градусы разворачивают иконку', (): void => {
            expect(hostStyle(setup({ rotate: 90 }), 'transform')).toBe('rotate(90deg)');
        });

        it('строка с числом принимается как атрибут разметки', (): void => {
            expect(hostStyle(setup({ rotate: '180' }), 'transform')).toBe('rotate(180deg)');
        });

        it('нулевой поворот не даёт transform — иначе создавался бы лишний слой отрисовки', (): void => {
            expect(hostStyle(setup({ rotate: 0 }), 'transform')).toBe('');
        });

        it('пустая строка равна отсутствию входа', (): void => {
            expect(hostStyle(setup({ rotate: '' }), 'transform')).toBe('');
        });

        it('нечисловая строка гасит поворот, а не роняет отрисовку', (): void => {
            expect(hostStyle(setup({ rotate: 'вверх' }), 'transform')).toBe('');
        });
    });

    describe('доступность', (): void => {
        it('иконка спрятана от скринридера — подпись даёт вмещающий её контрол', (): void => {
            const fixture: ComponentFixture<RtIconComponent> = setup();

            expect((fixture.nativeElement as HTMLElement).getAttribute('aria-hidden')).toBe('true');
        });

        it('svg исключён из таб-порядка и тоже спрятан', (): void => {
            const fixture: ComponentFixture<RtIconComponent> = setup();

            expect(el(fixture, 'svg')?.attributes['focusable']).toBe('false');
            expect(el(fixture, 'svg')?.attributes['aria-hidden']).toBe('true');
        });
    });

    it('смена имени перерисовывает ссылку на symbol', (): void => {
        const fixture: ComponentFixture<RtIconComponent> = setup({ name: 'check' });

        setInputs(fixture, { name: 'ico-close' });
        fixture.detectChanges();

        expect(el(fixture, 'use')?.attributes['href']).toBe('#rt-icon-ico-close');
    });

    it('оформление не завязано на модификаторы — размер и цвет едут стилем, не классом', (): void => {
        const fixture: ComponentFixture<RtIconComponent> = setup({ size: 'lg', color: 'danger' });

        expect(classesOf(fixture.nativeElement as HTMLElement)).toEqual(['rt-icon']);
    });
});
