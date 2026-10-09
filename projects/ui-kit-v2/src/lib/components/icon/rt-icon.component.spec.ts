import { HttpTestingController } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtButtonDirective } from '../button/rt-button.directive';
import { classesOf, createRtFixture, el, hostClasses, setInputs } from '../../../testing/rt-kit-testing';
import { RtIconComponent } from './rt-icon.component';
import { RT_ICON_PRESET_ATTRIBUTE, RT_ICON_SPRITE_ID } from './rt-icon.const';
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

/** Значки в своём наборе, под набором оформления и под признаком одних значков. */
@Component({
    selector: 'rt-test-icon-preset',
    imports: [RtIconComponent, RtButtonDirective],
    template: `
        <rt-icon qa-dataid="base" name="close" />
        <div data-preset="material"><rt-icon qa-dataid="theme" name="close" /></div>
        <div data-rt-icon-preset="material">
            <rt-icon qa-dataid="icons" name="close" />
            <rt-icon qa-dataid="unpaired" name="wallet" />
            <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
            <button rtButton qa-dataid="button" icon="close" label="Закрыть"></button>
        </div>
        <div data-rt-icon-preset="base"><rt-icon qa-dataid="explicit-base" name="close" /></div>
    `,
})
class TestIconPresetComponent {}

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
        it('без входа рисуется ступенью md — 20px шкалы кита', (): void => {
            const fixture: ComponentFixture<RtIconComponent> = setup();

            expect(hostStyle(fixture, 'width')).toBe('var(--rt-icon-step-md, var(--rt-size-5))');
            expect(hostStyle(fixture, 'height')).toBe('var(--rt-icon-step-md, var(--rt-size-5))');
        });

        it.each<[IRtIcon.Size, string]>([
            ['xs', 'var(--rt-icon-step-xs, var(--rt-size-3))'],
            ['sm', 'var(--rt-icon-step-sm, var(--rt-size-4))'],
            ['md', 'var(--rt-icon-step-md, var(--rt-size-5))'],
            ['lg', 'var(--rt-icon-step-lg, var(--rt-size-6))'],
            ['xl', 'var(--rt-icon-step-xl, var(--rt-size-8))'],
            ['2xl', 'var(--rt-icon-step-2xl, var(--rt-size-10))'],
            ['3xl', 'var(--rt-icon-step-3xl, var(--rt-size-12))'],
            ['4xl', 'var(--rt-icon-step-4xl, var(--rt-size-16))'],
        ])('SC-UKV-712 — ступень %s — свойство приложения с шагом шкалы %s', (size: IRtIcon.Size, expected: string): void => {
            const fixture: ComponentFixture<RtIconComponent> = setup({ size });

            expect(hostStyle(fixture, 'width')).toBe(expected);
            expect(hostStyle(fixture, 'height')).toBe(expected);
        });
    });

    describe('цвет', (): void => {
        it('без входа цвета не пишет — наследует цвет текста, и правило стилей снаружи его достаёт', (): void => {
            expect(hostStyle(setup(), 'color')).toBe('');
        });

        it.each<[IRtIcon.Color, string]>([
            ['primary', 'var(--rt-icon-color-primary, var(--rt-color-action-primary-on-surface))'],
            ['muted', 'var(--rt-icon-color-muted, var(--rt-neutral-600))'],
            ['disabled', 'var(--rt-icon-color-disabled, var(--rt-color-text-disabled))'],
            ['info', 'var(--rt-icon-color-info, var(--rt-color-state-info))'],
            ['success', 'var(--rt-icon-color-success, var(--rt-color-state-success))'],
            ['warning', 'var(--rt-icon-color-warning, var(--rt-color-state-warning))'],
            ['danger', 'var(--rt-icon-color-danger, var(--rt-color-state-danger))'],
            ['inverse', 'var(--rt-icon-color-inverse, var(--rt-color-text-inverse))'],
        ])('SC-UKV-711 — цвет %s — свойство приложения %s', (color: IRtIcon.Color, expected: string): void => {
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

    describe('признак одних значков', (): void => {
        afterEach((): void => {
            document.getElementById(RT_ICON_SPRITE_ID)?.remove();
        });

        function hrefOf(fixture: ComponentFixture<TestIconPresetComponent>, anchor: string): string | null {
            return (fixture.nativeElement as HTMLElement).querySelector(`[qa-dataid="${anchor}"] use`)?.getAttribute('href') ?? null;
        }

        it('имя атрибута — data-rt-icon-preset', (): void => {
            expect(RT_ICON_PRESET_ATTRIBUTE).toBe('data-rt-icon-preset');
        });

        it('SC-UKV-779 — значок и кнопка под признаком одних значков рисуют материальный рисунок', (): void => {
            const fixture: ComponentFixture<TestIconPresetComponent> = createRtFixture(TestIconPresetComponent, {});
            fixture.detectChanges();

            expect(hrefOf(fixture, 'base')).toBe('#rt-icon-close');
            expect(hrefOf(fixture, 'theme')).toBe('#rt-icon-material-close');
            expect(hrefOf(fixture, 'icons')).toBe('#rt-icon-material-close');
            expect(hrefOf(fixture, 'button')).toBe('#rt-icon-material-close');
        });

        it('имя без материального рисунка и признак со значением base рисуются своим набором', (): void => {
            const fixture: ComponentFixture<TestIconPresetComponent> = createRtFixture(TestIconPresetComponent, {});
            fixture.detectChanges();

            expect(hrefOf(fixture, 'unpaired')).toBe('#rt-icon-wallet');
            expect(hrefOf(fixture, 'explicit-base')).toBe('#rt-icon-close');
        });
    });
});
