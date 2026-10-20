import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { join } from 'node:path';

import * as sass from 'sass';

import { classesOf, createRtFixture, el, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';
import { IRtTabs } from './rt-tabs.model';
import { rtTabsCssDuration, rtTabsDurationMs } from './rt-tabs.motion';

/** Три вкладки с управляемым выбором: смена выбора идёт снаружи, как у приложения с адресом. */
@Component({
    selector: 'rt-tabs-motion-host',
    template: `
        <rt-tabs [activeId]="active()" [animationDuration]="duration()">
            <ng-template rtTab="a" label="Первая">Первая панель</ng-template>
            <ng-template rtTab="b" label="Вторая" [invalid]="invalid()">Вторая панель</ng-template>
            <ng-template rtTab="c" label="Третья">Третья панель</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class MotionHostComponent {
    public readonly active: WritableSignal<IRtTabs.Id> = signal<IRtTabs.Id>('a');
    public readonly duration: WritableSignal<IRtTabs.AnimationDuration> = signal<IRtTabs.AnimationDuration>(500);
    public readonly invalid: WritableSignal<boolean> = signal(false);
}

type THostFixture = ComponentFixture<MotionHostComponent>;

function setup(duration: IRtTabs.AnimationDuration = 500): THostFixture {
    const fixture: THostFixture = createRtFixture(MotionHostComponent, {}, { skipInitialDetect: true });
    fixture.componentInstance.duration.set(duration);
    fixture.detectChanges();

    return fixture;
}

function pick(fixture: THostFixture, id: IRtTabs.Id): void {
    fixture.componentInstance.active.set(id);
    fixture.detectChanges();
}

function panels(fixture: THostFixture): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.rt-tabs__content'));
}

function endMotion(fixture: THostFixture, target: HTMLElement): void {
    target.dispatchEvent(new Event('animationend', { bubbles: true }));
    fixture.detectChanges();
}

function tabsHost(fixture: THostFixture): HTMLElement {
    return el(fixture, 'rt-tabs')?.nativeElement as HTMLElement;
}

function compiledStyles(): string {
    return sass.compile(join(__dirname, 'rt-tabs.component.scss')).css.replace(/\s+/g, ' ');
}

describe('RtTabsComponent — движение при смене вкладки', (): void => {
    let reduced: boolean = false;
    const ownMatchMedia: typeof window.matchMedia | undefined = window.matchMedia;

    beforeEach((): void => {
        reduced = false;
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            writable: true,
            value: (query: string): Pick<MediaQueryList, 'matches' | 'media'> => ({
                matches: reduced && query.includes('reduce'),
                media: query,
            }),
        });
    });

    afterEach((): void => {
        Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: ownMatchMedia });
    });

    describe('SC-UKV-946 — панель прежней вкладки уходит, новая въезжает', (): void => {
        it('SC-UKV-946 — к вкладке правее прежняя панель уходит влево, новая въезжает справа', (): void => {
            const fixture: THostFixture = setup();

            pick(fixture, 'c');

            const leaving: HTMLElement = panels(fixture)[0];
            const entering: HTMLElement = panels(fixture)[1];
            expect(panels(fixture)).toHaveLength(2);
            expect(leaving.textContent?.trim()).toBe('Первая панель');
            expect(classesOf(leaving)).toEqual(expect.arrayContaining(['rt-tabs__content--leaving', 'rt-tabs__content--shift--forward']));
            expect(classesOf(entering)).toEqual(expect.arrayContaining(['rt-tabs__content--entering', 'rt-tabs__content--shift--forward']));
            expect(tabsHost(fixture).classList).toContain('rt-tabs--animating');
        });

        it('SC-UKV-946 — к вкладке левее движение зеркальное', (): void => {
            const fixture: THostFixture = setup();
            pick(fixture, 'c');
            endMotion(fixture, panels(fixture)[0]);

            pick(fixture, 'b');

            expect(classesOf(panels(fixture)[0])).toContain('rt-tabs__content--shift--backward');
            expect(classesOf(panels(fixture)[1])).toContain('rt-tabs__content--shift--backward');
        });

        it('SC-UKV-946 — уходящая панель не читается и не берёт фокус, якорь панели один', (): void => {
            const fixture: THostFixture = setup();

            pick(fixture, 'b');

            const leaving: HTMLElement = panels(fixture)[0];
            expect(leaving.getAttribute('aria-hidden')).toBe('true');
            expect(leaving.hasAttribute('inert')).toBe(true);
            expect(leaving.getAttribute('tabindex')).toBe('-1');
            expect(qaAll(fixture, 'tabs-panel')).toHaveLength(1);
            expect(((qa(fixture, 'tabs-panel')?.nativeElement as HTMLElement).textContent ?? '').trim()).toBe('Вторая панель');
        });

        it('SC-UKV-946 — конец движения убирает уходящую панель, а движение вложенного узла — нет', (): void => {
            const fixture: THostFixture = setup();
            pick(fixture, 'b');
            const leaving: HTMLElement = panels(fixture)[0];

            endMotion(fixture, leaving.appendChild(document.createElement('span')));
            expect(panels(fixture)).toHaveLength(2);

            endMotion(fixture, leaving);

            expect(panels(fixture)).toHaveLength(1);
            expect(tabsHost(fixture).classList).not.toContain('rt-tabs--animating');
            expect(classesOf(panels(fixture)[0])).not.toContain('rt-tabs__content--entering');
        });
    });

    describe('SC-UKV-947 — движение выключается', (): void => {
        it('SC-UKV-947 — нулевая длительность меняет панель на месте', (): void => {
            const fixture: THostFixture = setup(0);

            pick(fixture, 'b');

            expect(panels(fixture)).toHaveLength(1);
            expect(panels(fixture)[0].textContent?.trim()).toBe('Вторая панель');
        });

        it('SC-UKV-947 — prefers-reduced-motion меняет панель на месте', (): void => {
            reduced = true;
            const fixture: THostFixture = setup();

            pick(fixture, 'b');

            expect(panels(fixture)).toHaveLength(1);
        });

        it('SC-UKV-947 — стили снимают движение у того, кто просил обходиться без него', (): void => {
            const css: string = compiledStyles();
            const media: string = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));

            expect(media).toContain('.rt-tabs__ink--animated { transition: none');
            expect(media).toContain('animation: none');
        });
    });

    describe('SC-UKV-948 — длительность задаётся входом', (): void => {
        it('SC-UKV-948 — вход пишет длительность в свойства полосы и панели', (): void => {
            const fixture: THostFixture = setup('0.5s');

            expect(tabsHost(fixture).style.getPropertyValue('--rt-tabs-indicator-duration')).toBe('0.5s');
            expect(tabsHost(fixture).style.getPropertyValue('--rt-tabs-panel-duration')).toBe('0.5s');
        });

        it('SC-UKV-948 — без входа длительности остаются токенам', (): void => {
            const fixture: THostFixture = setup(null);

            expect(tabsHost(fixture).style.getPropertyValue('--rt-tabs-panel-duration')).toBe('');
        });

        it('SC-UKV-948 — число и строка из цифр — миллисекунды', (): void => {
            expect(rtTabsCssDuration(500)).toBe('500ms');
            expect(rtTabsCssDuration('250')).toBe('250ms');
            expect(rtTabsCssDuration('0.3s')).toBe('0.3s');
            expect(rtTabsCssDuration('')).toBeNull();
            expect(rtTabsDurationMs('0.5s')).toBe(500);
            expect(rtTabsDurationMs('120ms')).toBe(120);
            expect(rtTabsDurationMs('0ms')).toBe(0);
            expect(rtTabsDurationMs('')).toBe(0);
        });
    });

    describe('SC-UKV-949 — полоса выбранной вкладки — один элемент', (): void => {
        it('SC-UKV-949 — после замера полосу рисует общий элемент, своя у вкладки гаснет', (): void => {
            const fixture: THostFixture = setup();

            expect(classesOf(el(fixture, '.rt-tabs__ink'))).toContain('rt-tabs__ink--placed');
            expect(classesOf(qa(fixture, 'tabs-tab-list'))).toContain('rt-tabs__tab-list--ink');
            expect(compiledStyles()).toContain(
                '.rt-tabs__tab-list--ink .rt-tab-item--selected:not(.rt-tab-item--invalid):after { background-color: transparent'
            );
        });

        it('SC-UKV-949 — полоса неверной выбранной вкладки красная', (): void => {
            const fixture: THostFixture = setup();
            fixture.componentInstance.invalid.set(true);

            pick(fixture, 'b');

            expect(classesOf(el(fixture, '.rt-tabs__ink'))).toContain('rt-tabs__ink--invalid');
        });
    });
});
