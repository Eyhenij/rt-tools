import { ChangeDetectionStrategy, Component, DebugElement, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { join } from 'node:path';

import * as sass from 'sass';

import { classesOf, createRtFixture, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';
import { IRtTabs } from './rt-tabs.model';

/** Восемь вкладок, как в боковой панели с ролями: полоса шире своего места. */
@Component({
    selector: 'rt-tabs-scroll-keys-host',
    template: `
        <rt-tabs [activation]="activation()" [scrollArrows]="scrollArrows()" (activeIdChange)="picked = $event">
            <ng-template rtTab="a" label="Первая">Первая панель</ng-template>
            <ng-template rtTab="b" label="Вторая">Вторая панель</ng-template>
            <ng-template rtTab="c" label="Третья" [disabled]="true">Третья панель</ng-template>
            <ng-template rtTab="d" label="Четвёртая">Четвёртая панель</ng-template>
            <ng-template rtTab="e" label="Пятая">Пятая панель</ng-template>
            <ng-template rtTab="f" label="Шестая">Шестая панель</ng-template>
            <ng-template rtTab="g" label="Седьмая">Седьмая панель</ng-template>
            <ng-template rtTab="h" label="Восьмая">Восьмая панель</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class ScrollKeysHostComponent {
    public readonly activation: WritableSignal<IRtTabs.Activation> = signal<IRtTabs.Activation>('auto');
    public readonly scrollArrows: WritableSignal<IRtTabs.ScrollArrows> = signal<IRtTabs.ScrollArrows>('overlay');
    public picked: IRtTabs.Id | null = null;
}

type THostFixture = ComponentFixture<ScrollKeysHostComponent>;

function setup(activation: IRtTabs.Activation = 'auto', scrollArrows: IRtTabs.ScrollArrows = 'overlay'): THostFixture {
    const fixture: THostFixture = createRtFixture(ScrollKeysHostComponent, {}, { skipInitialDetect: true });
    fixture.componentInstance.activation.set(activation);
    fixture.componentInstance.scrollArrows.set(scrollArrows);
    fixture.detectChanges();

    return fixture;
}

function tabs(fixture: THostFixture): HTMLButtonElement[] {
    return qaAll(fixture, 'tabs-tab').map((node: DebugElement): HTMLButtonElement => node.nativeElement as HTMLButtonElement);
}

function press(fixture: THostFixture, target: HTMLElement, key: string): void {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
}

function panelText(fixture: THostFixture): string {
    return ((qa(fixture, 'tabs-panel')?.nativeElement as HTMLElement).textContent ?? '').trim();
}

function tabindexes(fixture: THostFixture): (string | null)[] {
    return tabs(fixture).map((node: HTMLButtonElement): string | null => node.getAttribute('tabindex'));
}

/**
 * Полоса в jsdom не раскладывается: ширины задаются руками, прокрутка — обычным полем.
 * После подмены полоса узнаёт о себе событием scroll, как в браузере.
 */
function overflow(fixture: THostFixture, scrollWidth: number, clientWidth: number, scrollLeft: number = 0): HTMLElement {
    const list: HTMLElement = qa(fixture, 'tabs-tab-list')?.nativeElement as HTMLElement;
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: scrollWidth });
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: clientWidth });
    Object.defineProperty(list, 'scrollLeft', { configurable: true, writable: true, value: scrollLeft });
    list.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    return list;
}

function arrow(fixture: THostFixture, id: string): HTMLElement {
    return qa(fixture, id)?.nativeElement as HTMLElement;
}

function compiledStyles(): string {
    return sass.compile(join(__dirname, 'rt-tabs.component.scss')).css.replace(/\s+/g, ' ');
}

/** Тело правила по началу его селектора. */
function ruleBody(css: string, selector: string): string {
    const at: number = css.indexOf(selector);

    if (at < 0) {
        return '';
    }
    const open: number = at + selector.length;

    return css.slice(open, css.indexOf('}', open)).trim();
}

describe('RtTabsComponent — клавиатура и стрелки прокрутки', (): void => {
    describe('SC-UKV-942 — ручной выбор с клавиатуры', (): void => {
        it('SC-UKV-942 — в ручном режиме стрелки и Home/End переводят фокус, не открывая вкладку', (): void => {
            const fixture: THostFixture = setup('manual');

            press(fixture, tabs(fixture)[0], 'ArrowRight');

            expect(document.activeElement).toBe(tabs(fixture)[1]);
            expect(tabindexes(fixture)).toEqual(['-1', '0', '-1', '-1', '-1', '-1', '-1', '-1']);
            expect(tabs(fixture)[0].getAttribute('aria-selected')).toBe('true');
            expect(panelText(fixture)).toBe('Первая панель');
            expect(fixture.componentInstance.picked).toBeNull();

            press(fixture, tabs(fixture)[1], 'ArrowRight');
            expect(document.activeElement).toBe(tabs(fixture)[3]);

            press(fixture, tabs(fixture)[3], 'End');
            expect(document.activeElement).toBe(tabs(fixture)[7]);

            press(fixture, tabs(fixture)[7], 'Home');
            expect(document.activeElement).toBe(tabs(fixture)[0]);
            expect(panelText(fixture)).toBe('Первая панель');
        });

        it('SC-UKV-942 — Enter или Space на вкладке в фокусе открывают её', (): void => {
            const fixture: THostFixture = setup('manual');

            press(fixture, tabs(fixture)[0], 'ArrowRight');
            press(fixture, tabs(fixture)[1], 'ArrowRight');
            // Enter и Space на кнопке браузер превращает в click.
            tabs(fixture)[3].click();
            fixture.detectChanges();

            expect(tabs(fixture)[3].getAttribute('aria-selected')).toBe('true');
            expect(panelText(fixture)).toBe('Четвёртая панель');
            expect(fixture.componentInstance.picked).toBe('d');
            expect(tabindexes(fixture)).toEqual(['-1', '-1', '-1', '0', '-1', '-1', '-1', '-1']);
        });

        it('SC-UKV-942 — по умолчанию стрелка открывает вкладку сразу, как прежде', (): void => {
            const fixture: THostFixture = setup();

            press(fixture, tabs(fixture)[0], 'ArrowRight');

            expect(tabs(fixture)[1].getAttribute('aria-selected')).toBe('true');
            expect(panelText(fixture)).toBe('Вторая панель');
            expect(fixture.componentInstance.picked).toBe('b');
        });
    });

    describe('SC-UKV-943 — нажатие на стрелку прокрутки', (): void => {
        afterEach((): void => {
            jest.useRealTimers();
        });

        it('SC-UKV-943 — короткое нажатие сдвигает полосу на ширину видимой области, не дальше края', (): void => {
            jest.useFakeTimers();
            const fixture: THostFixture = setup();
            const list: HTMLElement = overflow(fixture, 1000, 400);
            const next: HTMLElement = arrow(fixture, 'tabs-scroll-next');

            next.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
            next.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
            fixture.detectChanges();

            expect(list.scrollLeft).toBe(400);
            expect(classesOf(arrow(fixture, 'tabs-scroll-prev'))).toContain('rt-tabs__rest--visible');

            next.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
            next.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
            fixture.detectChanges();

            expect(list.scrollLeft).toBe(600);
            expect(classesOf(arrow(fixture, 'tabs-scroll-next'))).not.toContain('rt-tabs__rest--visible');
        });

        it('SC-UKV-943 — удержание прокручивает непрерывно, а отпускание после него не добавляет шага', (): void => {
            jest.useFakeTimers();
            const fixture: THostFixture = setup();
            const list: HTMLElement = overflow(fixture, 1000, 400);
            const next: HTMLElement = arrow(fixture, 'tabs-scroll-next');

            next.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
            jest.advanceTimersByTime(300 + 15 * 5);
            next.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
            jest.advanceTimersByTime(1000);

            expect(list.scrollLeft).toBe(60);
        });

        it('SC-UKV-943 — указатель ушёл со стрелки до отпускания: полоса не сдвигается', (): void => {
            jest.useFakeTimers();
            const fixture: THostFixture = setup();
            const list: HTMLElement = overflow(fixture, 1000, 400);
            const next: HTMLElement = arrow(fixture, 'tabs-scroll-next');

            next.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
            next.dispatchEvent(new MouseEvent('mouseleave'));
            next.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
            jest.advanceTimersByTime(1000);

            expect(list.scrollLeft).toBe(0);
        });
    });

    describe('SC-UKV-944 — стрелки в своих местах', (): void => {
        it('SC-UKV-944 — при переполнении обе стрелки стоят, а та, куда прокручивать некуда, неактивна', (): void => {
            const fixture: THostFixture = setup('auto', 'inline');
            const wrapper: HTMLElement = arrow(fixture, 'tabs-scroll-next').parentElement as HTMLElement;

            expect(classesOf(wrapper)).toContain('rt-tabs__tab-list-wrapper--inline');
            expect(classesOf(wrapper)).not.toContain('rt-tabs__tab-list-wrapper--overflowing');

            overflow(fixture, 1000, 400);

            expect(classesOf(wrapper)).toContain('rt-tabs__tab-list-wrapper--overflowing');
            expect(classesOf(arrow(fixture, 'tabs-scroll-prev'))).toContain('rt-tabs__rest--inactive');
            expect(classesOf(arrow(fixture, 'tabs-scroll-next'))).not.toContain('rt-tabs__rest--inactive');
        });

        it('SC-UKV-944 — по умолчанию стрелки остаются поверх вкладок, как прежде', (): void => {
            const fixture: THostFixture = setup();
            overflow(fixture, 1000, 400);

            expect(classesOf(arrow(fixture, 'tabs-scroll-next').parentElement as HTMLElement)).not.toContain(
                'rt-tabs__tab-list-wrapper--inline'
            );
        });

        it('SC-UKV-944 — стили прячут обе стрелки без переполнения и гасят неактивную', (): void => {
            const css: string = compiledStyles();

            expect(ruleBody(css, '.rt-tabs__tab-list-wrapper--inline .rt-tabs__rest {')).toContain('display: none');
            expect(ruleBody(css, '.rt-tabs__tab-list-wrapper--inline.rt-tabs__tab-list-wrapper--overflowing .rt-tabs__rest {')).toContain(
                'display: flex'
            );
            expect(ruleBody(css, '.rt-tabs__tab-list-wrapper--inline .rt-tabs__rest--inactive {')).toContain('pointer-events: none');
        });
    });

    it('SC-UKV-945 — полоса выбранной вкладки не опирается на calc от толщины черты', (): void => {
        // calc(-1 * 0) — число без единиц: bottom с ним недействителен, и при токене 0 полоса уезжала.
        const body: string = ruleBody(compiledStyles(), '.rt-tab-item:after {');

        expect(body).toContain('bottom: 0');
        expect(body).toContain('translate: 0 var(--rt-tab-item-border-width)');
        expect(body).not.toContain('calc(');
    });
});
