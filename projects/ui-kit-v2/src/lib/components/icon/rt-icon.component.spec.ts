import { HttpTestingController } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtButtonDirective } from '../button/rt-button.directive';
import { classesOf, createRtFixture, el, hostClasses, setInputs } from '../../../testing/rt-kit-testing';
import { RtIconComponent } from './rt-icon.component';
import { RT_ICON_SPRITE_ID } from './rt-icon.const';
import { IRtIcon } from './rt-icon.model';

/** Хост с обеими разметками значка: своим компонентом и кнопкой, рисующей значок сама. */
@Component({
    selector: 'rt-test-two-markups',
    imports: [RtIconComponent, RtButtonDirective],
    template: `
        <rt-icon name="check" />
        <button rtButton icon="check" label="Скачать"></button>
    `,
})
class TestTwoMarkupsComponent {}

/** Хост с одной разметкой — кнопкой: её значок никто, кроме неё самой, не просит. */
@Component({
    selector: 'rt-test-button-only',
    imports: [RtButtonDirective],
    template: `
        <button rtButton icon="wallet" label="Счёт"></button>
    `,
})
class TestButtonOnlyComponent {}

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
            ['muted', 'var(--rt-icon-color-muted, var(--rt-neutral-600))'],
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

    describe('запрос имени у реестра', (): void => {
        afterEach((): void => {
            document.getElementById(RT_ICON_SPRITE_ID)?.remove();
        });

        it('SC-UKV-61 — значок, спрошенный двумя разметками сразу, едет одним запросом', (): void => {
            createRtFixture(TestTwoMarkupsComponent, {});
            const http: HttpTestingController = TestBed.inject(HttpTestingController);

            http.expectOne('/icons/check.svg').flush('<svg viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>');

            http.verify();
        });

        it('кнопка просит значок сама, без компонента значка на странице', (): void => {
            createRtFixture(TestButtonOnlyComponent, {});
            const http: HttpTestingController = TestBed.inject(HttpTestingController);

            http.expectOne('/icons/wallet.svg').flush('<svg viewBox="0 0 16 16"></svg>');

            http.verify();
        });

        it('смена имени просит у реестра новое, а прежнее второй раз не просит', (): void => {
            const fixture: ComponentFixture<RtIconComponent> = setup({ name: 'check' });
            const http: HttpTestingController = TestBed.inject(HttpTestingController);
            http.expectOne('/icons/check.svg').flush('<svg viewBox="0 0 16 16"></svg>');

            setInputs(fixture, { name: 'wallet' });
            fixture.detectChanges();
            http.expectOne('/icons/wallet.svg').flush('<svg viewBox="0 0 16 16"></svg>');

            setInputs(fixture, { name: 'check' });
            fixture.detectChanges();
            http.expectNone('/icons/check.svg');
        });
    });
});
