import { Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockDirective } from './block.directive';
import { ElemDirective } from './elem.directive';

type TMods = string | string[] | (string | false)[] | Record<string, boolean | string> | undefined;

/**
 * Хост нужен потому, что имя блока и имя элемента директивы читают статическим атрибутом: без
 * разметки их нечем задать, а модификатор приходит привязкой и меняется по ходу.
 *
 * Модификаторы держит сигнал, а не обычное поле: среда прогона обходится без Zone.js, и там
 * `detectChanges()` обновляет только помеченное грязным. Присваивание обычному полю таким его
 * не помечает — привязка остаётся прежней, и вход директивы не меняется вовсе.
 */
@Component({
    standalone: true,
    imports: [BlockDirective, ElemDirective],
    template: `
        <div rtBlock="card" [rtMod]="blockMods()">
            <span rtElem="title" [rtMod]="elemMods()"></span>
        </div>
    `,
})
class TestBemHostComponent {
    public readonly blockMods: WritableSignal<TMods> = signal<TMods>(undefined);
    public readonly elemMods: WritableSignal<TMods> = signal<TMods>(undefined);
}

function setup(): ComponentFixture<TestBemHostComponent> {
    TestBed.configureTestingModule({ imports: [TestBemHostComponent] });

    const fixture: ComponentFixture<TestBemHostComponent> = TestBed.createComponent(TestBemHostComponent);
    fixture.detectChanges();

    return fixture;
}

function classesOf(fixture: ComponentFixture<TestBemHostComponent>, selector: string): string[] {
    const element: HTMLElement | null = (fixture.nativeElement as HTMLElement).querySelector(selector);

    return Array.from(element?.classList ?? []);
}

describe('директивы BEM', (): void => {
    it('ставит класс блока на элемент с атрибутом блока', (): void => {
        expect(classesOf(setup(), '[rtBlock]')).toContain('card');
    });

    it('ставит класс элемента, собранный из имени блока и имени элемента', (): void => {
        expect(classesOf(setup(), '[rtElem]')).toContain('card__title');
    });

    it('ставит модификатор блока, названный строкой', (): void => {
        const fixture: ComponentFixture<TestBemHostComponent> = setup();

        fixture.componentInstance.blockMods.set('active');
        fixture.detectChanges();

        expect(classesOf(fixture, '[rtBlock]')).toContain('card--active');
    });

    it('ставит все модификаторы блока, названные списком', (): void => {
        const fixture: ComponentFixture<TestBemHostComponent> = setup();

        fixture.componentInstance.blockMods.set(['active', 'big']);
        fixture.detectChanges();

        expect(classesOf(fixture, '[rtBlock]')).toEqual(expect.arrayContaining(['card--active', 'card--big']));
    });

    it('дописывает значение модификатора, названного объектом', (): void => {
        const fixture: ComponentFixture<TestBemHostComponent> = setup();

        fixture.componentInstance.blockMods.set({ size: 'large' });
        fixture.detectChanges();

        expect(classesOf(fixture, '[rtBlock]')).toContain('card--size--large');
    });

    it('снимает прежний модификатор, когда на его место пришёл другой', (): void => {
        const fixture: ComponentFixture<TestBemHostComponent> = setup();

        fixture.componentInstance.blockMods.set('active');
        fixture.detectChanges();
        fixture.componentInstance.blockMods.set('inactive');
        fixture.detectChanges();

        expect(classesOf(fixture, '[rtBlock]')).toContain('card--inactive');
        expect(classesOf(fixture, '[rtBlock]')).not.toContain('card--active');
    });

    it('ставит модификатор элемента поверх класса элемента', (): void => {
        const fixture: ComponentFixture<TestBemHostComponent> = setup();

        fixture.componentInstance.elemMods.set('active');
        fixture.detectChanges();

        expect(classesOf(fixture, '[rtElem]')).toContain('card__title--active');
    });
});
