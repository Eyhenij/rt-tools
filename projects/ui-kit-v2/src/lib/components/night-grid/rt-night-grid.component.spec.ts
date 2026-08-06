import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, qa, qaAll } from '../../../testing/rt-kit-testing';
import { IRtNightGrid } from './rt-night-grid.model';
import { RtNightGridComponent } from './rt-night-grid.component';

const CELLS: ReadonlyArray<IRtNightGrid.Cell> = [
    { id: '2026-03-01', state: 'free', title: '1 марта — свободно' },
    { id: '2026-03-02', state: 'primary', title: '2 марта — основной тур' },
    { id: '2026-03-03', state: 'secondary', title: '3 марта — дополнительный' },
];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtNightGridComponent> {
    return createRtFixture(RtNightGridComponent, { cells: CELLS, ...inputs });
}

function cells(fixture: ComponentFixture<RtNightGridComponent>): HTMLButtonElement[] {
    return qaAll(fixture, 'night-grid-cell').map((node: DebugElement): HTMLButtonElement => node.nativeElement as HTMLButtonElement);
}

describe('RtNightGridComponent', (): void => {
    it('рисует по клетке на каждую ночь', (): void => {
        expect(cells(setup()).length).toBe(3);
    });

    it('клетка — настоящая кнопка: до неё доходят клавиатурой', (): void => {
        expect(cells(setup())[0].tagName).toBe('BUTTON');
        expect(cells(setup())[0].type).toBe('button');
    });

    it('клетка не перебивает роль кнопки своей ролью', (): void => {
        // Явная роль на `<button>` вытесняет родную: с `role="listitem"`
        // скринридер называл бы элемент списка и умалчивал, что тут нажимают.
        expect(cells(setup())[0].getAttribute('role')).toBeNull();
    });

    it.each<IRtNightGrid.State>(['free', 'primary', 'secondary'])(
        'состояние %s помечает клетку модификатором и атрибутом данных',
        (state: IRtNightGrid.State): void => {
            const fixture: ComponentFixture<RtNightGridComponent> = setup({ cells: [{ id: 'x', state, title: 'Клетка' }] });

            expect(classesOf(cells(fixture)[0])).toContain(`rt-night-grid__cell--state--${state}`);
            expect(cells(fixture)[0].getAttribute('data-state')).toBe(state);
        }
    );

    it('клетка пустая — весь смысл несёт её подпись', (): void => {
        // Внутри клетки нет ни текста, ни иконки: сетка плотная, и подпись
        // существует только для подсказки и скринридера.
        const fixture: ComponentFixture<RtNightGridComponent> = setup();

        expect(cells(fixture)[0].textContent?.trim()).toBe('');
        expect(cells(fixture)[0].getAttribute('title')).toBe('1 марта — свободно');
        expect(cells(fixture)[0].getAttribute('aria-label')).toBe('1 марта — свободно');
    });

    it('нажатие отдаёт целую клетку, а не её идентификатор', (): void => {
        const fixture: ComponentFixture<RtNightGridComponent> = setup();
        const picked: IRtNightGrid.Cell[] = [];
        fixture.componentInstance.cellClick.subscribe((cell: IRtNightGrid.Cell): void => {
            picked.push(cell);
        });

        cells(fixture)[1].click();
        fixture.detectChanges();

        expect(picked).toEqual([CELLS[1]]);
    });

    it('идентификатор ночи продублирован атрибутом данных', (): void => {
        expect(cells(setup())[0].getAttribute('data-id')).toBe('2026-03-01');
    });

    describe('подпись сетки', (): void => {
        it('без входа берётся из словаря кита', (): void => {
            expect(qa(setup(), 'night-grid')?.attributes['aria-label']).toBe('Occupancy grid');
        });

        it('своя подпись перебивает переведённую', (): void => {
            expect(qa(setup({ ariaLabel: 'Ночи марта' }), 'night-grid')?.attributes['aria-label']).toBe('Ночи марта');
        });

        it('сетка объявлена группой — она собирает кнопки, а не пункты списка', (): void => {
            expect(qa(setup(), 'night-grid')?.attributes['role']).toBe('group');
        });
    });

    it('пустой набор рисует пустую сетку', (): void => {
        expect(cells(setup({ cells: [] })).length).toBe(0);
    });
});
