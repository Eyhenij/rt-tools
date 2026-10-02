import { HttpTestingController } from '@angular/common/http/testing';
import { EnvironmentInjector, Provider, createEnvironmentInjector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { classesOf, createRtFixture, el } from '../../../testing/rt-kit-testing';
import { RT_ICON_GLYPH_STRATEGY, RtIconFontService } from './rt-icon-font.service';
import { RtIconComponent } from './rt-icon.component';
import { RT_ICON_SPRITE_ID } from './rt-icon.const';
import { IRtIcon } from './rt-icon.model';
import { provideRtIcons } from './rt-icon.providers';
import { RT_ICONS_BASE_URL, RT_ICONS_MATERIAL_BASE_URL } from './rt-icon.registry';

function setup(inputs: Readonly<Record<string, unknown>>, providers: Provider[] = []): ComponentFixture<RtIconComponent> {
    return createRtFixture(RtIconComponent, inputs, { providers });
}

function glyphNode(fixture: ComponentFixture<RtIconComponent>): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.rt-icon__glyph');
}

describe('RtIconComponent — глиф Material', (): void => {
    afterEach((): void => {
        document.getElementById(RT_ICON_SPRITE_ID)?.remove();
    });

    it('SC-UKV-543 — глиф с парой рисует пару из набора кита', (): void => {
        const fixture: ComponentFixture<RtIconComponent> = setup({ glyph: 'arrow_back' });

        expect(el(fixture, 'use')?.attributes['href']).toBe('#rt-icon-arrow-left');
        expect(glyphNode(fixture)).toBeNull();
    });

    it('SC-UKV-544 — глиф без пары рисует лигатуру шрифта и в набор не ходит', (): void => {
        const fixture: ComponentFixture<RtIconComponent> = setup({ glyph: 'pets', size: 'lg' });
        const http: HttpTestingController = TestBed.inject(HttpTestingController);

        expect(el(fixture, 'svg')).toBeNull();
        expect(glyphNode(fixture)?.textContent?.trim()).toBe('pets');
        expect(glyphNode(fixture)?.style.fontSize).toBe('24px');
        http.verify();
    });

    it('SC-UKV-545 — имя кита побеждает глиф, когда переданы оба', (): void => {
        const fixture: ComponentFixture<RtIconComponent> = setup({ name: 'check', glyph: 'pets' });

        expect(el(fixture, 'use')?.attributes['href']).toBe('#rt-icon-check');
        expect(glyphNode(fixture)).toBeNull();
    });

    it('SC-UKV-546 — по стратегии font глиф с парой тоже рисуется лигатурой', (): void => {
        const fixture: ComponentFixture<RtIconComponent> = setup({ glyph: 'arrow_back' }, [
            { provide: RT_ICON_GLYPH_STRATEGY, useValue: 'font' },
        ]);

        expect(el(fixture, 'svg')).toBeNull();
        expect(glyphNode(fixture)?.textContent?.trim()).toBe('arrow_back');
    });

    it('SC-UKV-547 — заливка значка ставит заливку шрифта лигатуре', (): void => {
        const fixture: ComponentFixture<RtIconComponent> = setup({ glyph: 'pets', fill: true });

        expect(classesOf(glyphNode(fixture) as HTMLElement)).toContain('rt-icon__glyph--filled');
    });

    it('SC-UKV-548 — лигатура скрыта, пока шрифты страницы не готовы', (): void => {
        const fixture: ComponentFixture<RtIconComponent> = setup({ glyph: 'pets' }, [
            { provide: RtIconFontService, useValue: { ready: (): boolean => false } },
        ]);

        expect(classesOf(glyphNode(fixture) as HTMLElement)).toContain('rt-icon__glyph--pending');
    });

    it('в окружении без интерфейса шрифтов лигатура видна сразу', (): void => {
        const fixture: ComponentFixture<RtIconComponent> = setup({ glyph: 'pets' });

        expect(classesOf(glyphNode(fixture) as HTMLElement)).not.toContain('rt-icon__glyph--pending');
    });

    it('без имени и глифа значок пуст и ничего не просит', (): void => {
        const fixture: ComponentFixture<RtIconComponent> = setup({});
        const http: HttpTestingController = TestBed.inject(HttpTestingController);

        expect(el(fixture, 'svg')).toBeNull();
        expect(glyphNode(fixture)).toBeNull();
        http.verify();
    });
});

describe('provideRtIcons — настройки значков', (): void => {
    function injectorOf(...args: Parameters<typeof provideRtIcons>): EnvironmentInjector {
        return createEnvironmentInjector([provideRtIcons(...args)], TestBed.inject(EnvironmentInjector));
    }

    it('SC-UKV-549 — вызов с двумя адресами работает как прежде, стратегия map-first', (): void => {
        const injector: EnvironmentInjector = injectorOf('/a', '/b');

        expect(injector.get(RT_ICONS_BASE_URL)).toBe('/a');
        expect(injector.get(RT_ICONS_MATERIAL_BASE_URL)).toBe('/b');
        expect(injector.get(RT_ICON_GLYPH_STRATEGY)).toBe<IRtIcon.GlyphStrategy>('map-first');
    });

    it('SC-UKV-550 — третий аргумент задаёт стратегию', (): void => {
        const injector: EnvironmentInjector = injectorOf(undefined, undefined, { glyphStrategy: 'font' });

        expect(injector.get(RT_ICON_GLYPH_STRATEGY)).toBe<IRtIcon.GlyphStrategy>('font');
    });
});
