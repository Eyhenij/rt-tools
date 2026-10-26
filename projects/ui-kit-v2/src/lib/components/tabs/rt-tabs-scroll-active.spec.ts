import { ChangeDetectionStrategy, Component, DebugElement, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';
import { IRtTabs } from './rt-tabs.model';
import { rtTabsIntoViewTarget } from './rt-tabs.scroll';

/** Пять вкладок без отключённых и скрытых: полоса шире своего места. */
@Component({
    selector: 'rt-tabs-scroll-active-host',
    template: `
        <rt-tabs [activeId]="activeId()" [animationDuration]="0" [scrollArrows]="scrollArrows()">
            <ng-template rtTab="a" label="Первая">Первая</ng-template>
            <ng-template rtTab="b" label="Вторая">Вторая</ng-template>
            <ng-template rtTab="c" label="Третья">Третья</ng-template>
            <ng-template rtTab="d" label="Четвёртая">Четвёртая</ng-template>
            <ng-template rtTab="e" label="Пятая">Пятая</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class ScrollActiveHostComponent {
    public readonly activeId: WritableSignal<IRtTabs.Id | null> = signal<IRtTabs.Id | null>(null);
    public readonly scrollArrows: WritableSignal<IRtTabs.ScrollArrows> = signal<IRtTabs.ScrollArrows>('overlay');
}

type THostFixture = ComponentFixture<ScrollActiveHostComponent>;

// Полоса прокручивается уже на первой отрисовке, поэтому размеры подставлены на прототипах до
// создания компонента: вкладка шириной 100, их пять — полоса 500 в окне 250, стрелка 40.
const TAB_WIDTH: number = 100;
const LIST_WIDTH: number = 250;
const REST_WIDTH: number = 40;

const scrollLefts: WeakMap<Element, number> = new WeakMap<Element, number>();
let scrollWrites: number = 0;

function isList(node: Element): boolean {
    return node.getAttribute('qa-dataid') === 'tabs-tab-list';
}

function tabItems(list: Element): Element[] {
    return Array.from(list.children).filter((node: Element): boolean => node.hasAttribute('data-tabitem'));
}

function scrollWidthOf(node: Element): number {
    return isList(node) ? tabItems(node).length * TAB_WIDTH : 0;
}

function open(activeId: IRtTabs.Id | null, scrollArrows: IRtTabs.ScrollArrows = 'overlay'): THostFixture {
    const fixture: THostFixture = createRtFixture(ScrollActiveHostComponent, {}, { skipInitialDetect: true });
    fixture.componentInstance.activeId.set(activeId);
    fixture.componentInstance.scrollArrows.set(scrollArrows);
    fixture.detectChanges();

    return fixture;
}

function list(fixture: THostFixture): HTMLElement {
    return qa(fixture, 'tabs-tab-list')?.nativeElement as HTMLElement;
}

function restVisible(fixture: THostFixture, side: 'prev' | 'next'): boolean {
    return classesOf(qa(fixture, `tabs-scroll-${side}`)).includes('rt-tabs__rest--visible');
}

describe('RtTabsComponent — полоса прокручена к выбранной вкладке', (): void => {
    beforeEach((): void => {
        scrollWrites = 0;
        jest.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement): number {
            const parent: Element | null = this.parentElement;
            return this.hasAttribute('data-tabitem') && parent ? tabItems(parent).indexOf(this) * TAB_WIDTH : 0;
        });
        jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement): number {
            if (this.hasAttribute('data-tabitem')) {
                return TAB_WIDTH;
            }
            return this.classList.contains('rt-tabs__rest') ? REST_WIDTH : 0;
        });
        jest.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element): number {
            return isList(this) ? LIST_WIDTH : 0;
        });
        jest.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(function (this: Element): number {
            return scrollWidthOf(this);
        });
        jest.spyOn(Element.prototype, 'scrollLeft', 'get').mockImplementation(function (this: Element): number {
            return scrollLefts.get(this) ?? 0;
        });
        jest.spyOn(Element.prototype, 'scrollLeft', 'set').mockImplementation(function (this: Element, value: number): void {
            scrollWrites++;
            const max: number = Math.max(scrollWidthOf(this) - LIST_WIDTH, 0);
            scrollLefts.set(this, Math.min(Math.max(value, 0), max));
        });
    });

    afterEach((): void => {
        jest.restoreAllMocks();
    });

    it('SC-UKV-1027 — полоса, открытая на последней вкладке, прокручена к ней', (): void => {
        const fixture: THostFixture = open('e');

        // Последняя вкладка 400…500 целиком в окне 250…500, левая стрелка 250…290 её не закрывает.
        expect(list(fixture).scrollLeft).toBe(250);
        expect(restVisible(fixture, 'prev')).toBe(true);
        expect(restVisible(fixture, 'next')).toBe(false);
    });

    it('SC-UKV-1028 — смена activeId извне прокручивает полосу к новой вкладке', (): void => {
        const fixture: THostFixture = open('e');

        fixture.componentInstance.activeId.set('a');
        fixture.detectChanges();

        expect(list(fixture).scrollLeft).toBe(0);
        expect(restVisible(fixture, 'prev')).toBe(false);
        expect(restVisible(fixture, 'next')).toBe(true);

        // Средняя вкладка 200…300 отступает от правой стрелки: окно 90…340, стрелка 300…340.
        fixture.componentInstance.activeId.set('c');
        fixture.detectChanges();

        expect(list(fixture).scrollLeft).toBe(90);
        expect(restVisible(fixture, 'prev')).toBe(true);
        expect(restVisible(fixture, 'next')).toBe(true);
    });

    it('SC-UKV-1028 — со стрелками рядом с полосой вкладка встаёт к самому краю', (): void => {
        const fixture: THostFixture = open('c', 'inline');

        // Стрелки не лежат поверх вкладок: отступать от края не от чего, окно 50…300.
        expect(list(fixture).scrollLeft).toBe(50);
    });

    it('SC-UKV-1029 — нажатие прокручивает полосу один раз', (): void => {
        const fixture: THostFixture = open(null);
        expect(scrollWrites).toBe(0);

        const fourth: DebugElement = qaAll(fixture, 'tabs-tab')[3];
        (fourth.nativeElement as HTMLButtonElement).click();
        fixture.detectChanges();

        // Четвёртая вкладка 300…400 и стрелка за ней: окно 190…440.
        expect(list(fixture).scrollLeft).toBe(190);
        expect(scrollWrites).toBe(1);
    });

    it('SC-UKV-1029 — цель прокрутки отступает от стрелки, но не у конца полосы', (): void => {
        const strip: HTMLElement = document.createElement('div');
        strip.setAttribute('qa-dataid', 'tabs-tab-list');
        const items: HTMLElement[] = [0, 1, 2, 3, 4].map((): HTMLElement => {
            const item: HTMLElement = document.createElement('div');
            item.setAttribute('data-tabitem', '');
            strip.appendChild(item);
            return item;
        });

        expect(rtTabsIntoViewTarget(strip, items[4], REST_WIDTH)).toBe(250);
        expect(rtTabsIntoViewTarget(strip, items[3], REST_WIDTH)).toBe(190);
        expect(rtTabsIntoViewTarget(strip, items[0], REST_WIDTH)).toBeNull();
        expect(rtTabsIntoViewTarget(strip, items[3])).toBe(150);
    });
});
