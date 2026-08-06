import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { IRtBarList } from './rt-bar-list.model';
import { RtBarListComponent } from './rt-bar-list.component';

const ROWS: ReadonlyArray<IRtBarList.Row> = [
    { id: 'direct', title: 'Прямые заходы', meta: '1 240 визитов', value: '52%', sharePercent: 52 },
    { id: 'search', title: 'Поиск', value: '31%', sharePercent: 31 },
];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtBarListComponent> {
    return createRtFixture(RtBarListComponent, { rows: ROWS, ...inputs });
}

function fillWidths(fixture: ComponentFixture<RtBarListComponent>): string[] {
    return qaAll(fixture, 'bar-list-row-fill').map((node: DebugElement): string => (node.nativeElement as HTMLElement).style.width);
}

describe('RtBarListComponent', (): void => {
    it('рисует по строке на каждую запись', (): void => {
        expect(qaAll(setup(), 'bar-list-row-title').map((node: DebugElement): string => textOf(node))).toEqual(['Прямые заходы', 'Поиск']);
    });

    it('значение рисуется рядом с названием', (): void => {
        expect(qaAll(setup(), 'bar-list-row-value').map((node: DebugElement): string => textOf(node))).toEqual(['52%', '31%']);
    });

    it('доля задаёт ширину полосы', (): void => {
        expect(fillWidths(setup())).toEqual(['52%', '31%']);
    });

    it('приписка рисуется, только когда передана', (): void => {
        const fixture: ComponentFixture<RtBarListComponent> = setup();

        expect(qaAll(fixture, 'bar-list-row-meta').length).toBe(1);
        expect(textOf(qa(fixture, 'bar-list-row-meta'))).toBe('1 240 визитов');
    });

    it('идентификатор строки продублирован атрибутом данных', (): void => {
        expect((qa(setup(), 'bar-list-row')?.nativeElement as HTMLElement).getAttribute('data-id')).toBe('direct');
    });

    describe('заголовок', (): void => {
        it('без входа не рисуется', (): void => {
            expect(qa(setup(), 'bar-list-title')).toBeNull();
        });

        it('рисуется, когда задан', (): void => {
            expect(textOf(qa(setup({ title: 'Источники' }), 'bar-list-title'))).toBe('Источники');
        });
    });

    describe('пустой набор', (): void => {
        it('подменяет список заглушкой с переведённым текстом', (): void => {
            const fixture: ComponentFixture<RtBarListComponent> = setup({ rows: [] });

            expect(qa(fixture, 'bar-list-rows')).toBeNull();
            expect(textOf(qa(fixture, 'bar-list-empty-text'))).toBe('No data yet');
        });

        it('свой текст заглушки перебивает переведённый', (): void => {
            const fixture: ComponentFixture<RtBarListComponent> = setup({ rows: [], emptyText: 'Пока нет переходов' });

            expect(textOf(qa(fixture, 'bar-list-empty-text'))).toBe('Пока нет переходов');
        });
    });
});
