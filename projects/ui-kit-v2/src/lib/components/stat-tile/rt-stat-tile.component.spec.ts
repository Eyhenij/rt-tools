import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, qa, textOf } from '../../../testing/rt-kit-testing';
import { IRtStatTile } from './rt-stat-tile.model';
import { RtStatTileComponent } from './rt-stat-tile.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtStatTileComponent> {
    return createRtFixture(RtStatTileComponent, { label: 'Визиты', value: '1 240', ...inputs });
}

function delta(percent: number | null, patch: Partial<IRtStatTile.Delta> = {}): IRtStatTile.Delta {
    return { percent, label: 'к прошлой неделе', ...patch };
}

function deltaText(fixture: ComponentFixture<RtStatTileComponent>): string {
    return textOf(qa(fixture, 'stat-tile-delta-percent'));
}

describe('RtStatTileComponent', (): void => {
    it('рисует подпись и значение', (): void => {
        const fixture: ComponentFixture<RtStatTileComponent> = setup();

        expect(textOf(qa(fixture, 'stat-tile-label'))).toBe('Визиты');
        expect(textOf(qa(fixture, 'stat-tile-value'))).toBe('1 240');
    });

    it('рисуется отдельной статьёй — плитка самостоятельна', (): void => {
        expect((qa(setup(), 'stat-tile')?.nativeElement as HTMLElement).tagName).toBe('ARTICLE');
    });

    describe('изменение', (): void => {
        it('без входа не рисуется', (): void => {
            expect(qa(setup(), 'stat-tile-delta')).toBeNull();
        });

        it('рост показывается со знаком плюс и стрелкой вверх', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(12.5) });

            expect(deltaText(fixture)).toBe('+12,5 %');
            expect(el(fixture, '.rt-stat-tile__delta-icon use')?.attributes['href']).toBe('#rt-icon-arrow-up');
        });

        it('падение показывается со своим знаком и стрелкой вниз', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(-4) });

            expect(deltaText(fixture)).toBe('-4 %');
            expect(el(fixture, '.rt-stat-tile__delta-icon use')?.attributes['href']).toBe('#rt-icon-arrow-down');
        });

        it('ноль — это не рост и не падение, а ровная линия', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(0) });

            expect(deltaText(fixture)).toBe('0 %');
            expect(qa(fixture, 'stat-tile-delta')?.attributes['data-direction']).toBe('flat');
        });

        it('неизвестное изменение не рисуется вовсе', (): void => {
            // `percent: null` означает «сравнить не с чем»: пустая плашка на
            // месте изменения читалась бы как ноль.
            expect(qa(setup({ deltaPrimary: delta(null) }), 'stat-tile-delta')).toBeNull();
        });

        it('дробная часть отделяется запятой', (): void => {
            expect(deltaText(setup({ deltaPrimary: delta(3.7) }))).toBe('+3,7 %');
        });

        it('направление помечает элемент модификатором и атрибутом данных', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(5) });

            expect(classesOf(qa(fixture, 'stat-tile-delta'))).toContain('rt-stat-tile__delta--direction--up');
            expect(qa(fixture, 'stat-tile-delta')?.attributes['data-direction']).toBe('up');
        });

        it('подпись изменения уезжает во всплывающую подсказку элемента', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(5) });

            expect(qa(fixture, 'stat-tile-delta')?.attributes['title']).toBe('к прошлой неделе');
        });
    });

    describe('второе изменение', (): void => {
        it('рисуется отдельной строкой с переведённой приставкой', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaSecondary: delta(8, { label: 'к прошлому году' }) });

            expect(textOf(qa(fixture, 'stat-tile-year'))).toBe('YoY +8 %');
        });

        it('без входа не рисуется', (): void => {
            expect(qa(setup(), 'stat-tile-year')).toBeNull();
        });
    });

    describe('база сравнения', (): void => {
        it('само значение до строки не доезжает — известный дефект', (): void => {
            // Подпись берётся `translateSignal('rtKit.uiBaseline')`, и Transloco
            // подставляет в `{{value}}` пустоту ещё до того, как компонент
            // попробует заменить плейсхолдер сам. Замена не находит ничего, и на
            // экране остаётся одна приставка. Чинится передачей значения
            // параметром перевода, а не `String.replace` после него.
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(5, { baseline: '1 100' }) });

            expect(textOf(qa(fixture, 'stat-tile-baseline'))).toBe('was');
            expect(textOf(qa(fixture, 'stat-tile-baseline'))).not.toContain('1 100');
        });

        it('без базы строки нет', (): void => {
            expect(qa(setup({ deltaPrimary: delta(5) }), 'stat-tile-baseline')).toBeNull();
        });
    });

    describe('дополнения', (): void => {
        it('вторая строка значения рисуется, когда задана', (): void => {
            expect(textOf(qa(setup({ secondary: 'из них 300 новых' }), 'stat-tile-secondary'))).toBe('из них 300 новых');
        });

        it('пояснение рисуется иконкой с подсказкой', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ hint: 'Считается по уникальным' });

            expect(qa(fixture, 'stat-tile-hint')?.attributes['title']).toBe('Считается по уникальным');
        });

        it('без пояснения иконки нет', (): void => {
            expect(qa(setup(), 'stat-tile-hint')).toBeNull();
        });
    });
});
