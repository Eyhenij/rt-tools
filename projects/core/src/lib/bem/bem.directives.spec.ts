import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockDirective } from './block.directive';
import { ElemDirective } from './elem.directive';

/**
 * Хост нужен потому, что имя блока и имя элемента директивы читают статическим атрибутом: без
 * разметки их нечем задать, а модификатор приходит привязкой и меняется по ходу.
 */
@Component({
    standalone: true,
    imports: [BlockDirective, ElemDirective],
    template: `
        <div rtBlock="card" [rtMod]="blockMods">
            <span rtElem="title" [rtMod]="elemMods"></span>
        </div>
    `,
})
class TestBemHostComponent {
    public blockMods: string | string[] | (string | false)[] | Record<string, boolean | string> | undefined = undefined;
    public elemMods: string | string[] | (string | false)[] | Record<string, boolean | string> | undefined = undefined;
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
});
