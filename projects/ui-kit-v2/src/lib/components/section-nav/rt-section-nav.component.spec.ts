import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, qa, qaAll, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { IRtSectionNav } from './rt-section-nav.model';
import { RtSectionNavComponent } from './rt-section-nav.component';

const ITEMS: ReadonlyArray<IRtSectionNav.Item> = [
    { id: 'general', icon: 'ico-settings', label: 'Общие', active: true },
    { id: 'members', icon: 'ico-user', label: 'Участники', active: false },
];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtSectionNavComponent> {
    return createRtFixture(RtSectionNavComponent, { items: ITEMS, ...inputs });
}

function tiles(fixture: ComponentFixture<RtSectionNavComponent>): HTMLButtonElement[] {
    return qaAll(fixture, 'section-nav-tile').map((node: DebugElement): HTMLButtonElement => node.nativeElement as HTMLButtonElement);
}

describe('RtSectionNavComponent', (): void => {
    it('рисует по плитке на каждый раздел', (): void => {
        expect(tiles(setup()).map((node: HTMLButtonElement): string => (node.textContent ?? '').trim())).toEqual(['Общие', 'Участники']);
    });

    it('плитка — настоящая кнопка, а не кликабельный див', (): void => {
        expect(tiles(setup())[0].tagName).toBe('BUTTON');
        expect(tiles(setup())[0].type).toBe('button');
    });

    it('иконка раздела рисуется из общего набора', (): void => {
        expect(el(setup(), '[qa-dataid="section-nav-tile"] use')?.attributes['href']).toBe('#rt-icon-ico-settings');
    });

    describe('активный раздел', (): void => {
        it('помечен модификатором, атрибутом данных и признаком текущей страницы', (): void => {
            const fixture: ComponentFixture<RtSectionNavComponent> = setup();

            expect(classesOf(tiles(fixture)[0])).toContain('rt-section-nav__tile--active');
            expect(tiles(fixture)[0].getAttribute('data-active')).toBe('true');
            expect(tiles(fixture)[0].getAttribute('aria-current')).toBe('page');
        });

        it('у остальных признака текущей страницы нет', (): void => {
            expect(tiles(setup())[1].getAttribute('aria-current')).toBeNull();
        });

        it('активность приходит снаружи — сама плитка её не переключает', (): void => {
            // Раздел выбирает маршрут приложения, поэтому нажатие только просит
            // о переходе, а подсветку двигает уже новый набор.
            const fixture: ComponentFixture<RtSectionNavComponent> = setup();

            tiles(fixture)[1].click();
            fixture.detectChanges();

            expect(tiles(fixture)[0].getAttribute('aria-current')).toBe('page');
        });
    });

    it('нажатие просит открыть раздел по его идентификатору', (): void => {
        const fixture: ComponentFixture<RtSectionNavComponent> = setup();
        const picked: string[] = [];
        fixture.componentInstance.itemSelect.subscribe((id: string): void => {
            picked.push(id);
        });

        tiles(fixture)[1].click();
        fixture.detectChanges();

        expect(picked).toEqual(['members']);
    });

    it('идентификатор раздела продублирован атрибутом данных', (): void => {
        expect(tiles(setup())[1].getAttribute('data-key')).toBe('members');
    });

    it('новый набор разделов перерисовывает плитки', (): void => {
        const fixture: ComponentFixture<RtSectionNavComponent> = setup();

        setInputs(fixture, { items: [{ id: 'billing', icon: 'ico-wallet', label: 'Оплата', active: true }] });
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'section-nav-tile'))).toBe('Оплата');
    });

    it('пустой набор рисует пустую навигацию, а не роняет отрисовку', (): void => {
        expect(tiles(setup({ items: [] })).length).toBe(0);
    });
});
