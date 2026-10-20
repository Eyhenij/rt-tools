import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { join } from 'node:path';

import * as sass from 'sass';

import { classesOf, createRtFixture, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';
import { IRtTabs } from './rt-tabs.model';

/** Три вкладки с полем ввода в каждой: по полю видно, живо ли тело вкладки после ухода с неё. */
@Component({
    selector: 'rt-tabs-preserve-host',
    template: `
        <rt-tabs [activeId]="active()" [preserveContent]="preserve()" [animationDuration]="duration()">
            <ng-template rtTab="a" label="Первая"><input qa-dataid="field-a" /></ng-template>
            <ng-template rtTab="b" label="Вторая"><input qa-dataid="field-b" /></ng-template>
            <ng-template rtTab="c" label="Третья"><input qa-dataid="field-c" /></ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class PreserveHostComponent {
    public readonly active: WritableSignal<IRtTabs.Id> = signal<IRtTabs.Id>('a');
    public readonly preserve: WritableSignal<boolean> = signal(true);
    public readonly duration: WritableSignal<IRtTabs.AnimationDuration> = signal<IRtTabs.AnimationDuration>(0);
}

type THostFixture = ComponentFixture<PreserveHostComponent>;

function setup(preserve: boolean, duration: IRtTabs.AnimationDuration = 0): THostFixture {
    const fixture: THostFixture = createRtFixture(PreserveHostComponent, {}, { skipInitialDetect: true });
    fixture.componentInstance.preserve.set(preserve);
    fixture.componentInstance.duration.set(duration);
    fixture.detectChanges();

    return fixture;
}

function pick(fixture: THostFixture, id: IRtTabs.Id): void {
    fixture.componentInstance.active.set(id);
    fixture.detectChanges();
}

function field(fixture: THostFixture, id: string): HTMLInputElement | undefined {
    return qa(fixture, id)?.nativeElement as HTMLInputElement | undefined;
}

function panelOf(input: HTMLElement | undefined): HTMLElement | null {
    return input?.closest<HTMLElement>('.rt-tabs__content') ?? null;
}

function panels(fixture: THostFixture): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.rt-tabs__content'));
}

describe('RtTabsComponent — тела посещённых вкладок', (): void => {
    const ownMatchMedia: typeof window.matchMedia | undefined = window.matchMedia;

    beforeEach((): void => {
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            writable: true,
            value: (query: string): Pick<MediaQueryList, 'matches' | 'media'> => ({ matches: false, media: query }),
        });
    });

    afterEach((): void => {
        Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: ownMatchMedia });
    });

    describe('SC-UKV-950 — тело посещённой вкладки живёт после ухода с неё', (): void => {
        it('SC-UKV-950 — введённое на вкладке остаётся, когда на неё вернулись', (): void => {
            const fixture: THostFixture = setup(true);
            const typed: HTMLInputElement | undefined = field(fixture, 'field-a');
            (typed as HTMLInputElement).value = 'введено';

            pick(fixture, 'b');
            pick(fixture, 'a');

            expect(field(fixture, 'field-a')).toBe(typed);
            expect(field(fixture, 'field-a')?.value).toBe('введено');
        });

        it('SC-UKV-950 — неактивное тело скрыто, не читается и вне таб-порядка; панель с якорем одна', (): void => {
            const fixture: THostFixture = setup(true);

            pick(fixture, 'b');

            const idle: HTMLElement | null = panelOf(field(fixture, 'field-a'));
            expect(idle?.hidden).toBe(true);
            expect(idle?.getAttribute('aria-hidden')).toBe('true');
            expect(idle?.hasAttribute('inert')).toBe(true);
            expect(idle?.getAttribute('tabindex')).toBe('-1');
            expect(idle?.getAttribute('qa-dataid')).toBe('tabs-panel-idle');
            expect(classesOf(idle)).toContain('rt-tabs__content--idle');
            expect(qaAll(fixture, 'tabs-panel')).toHaveLength(1);
            expect(panelOf(field(fixture, 'field-b'))?.getAttribute('qa-dataid')).toBe('tabs-panel');
        });

        it('SC-UKV-950 — вкладка, которую не открывали, не создаётся', (): void => {
            const fixture: THostFixture = setup(true);

            pick(fixture, 'b');

            expect(field(fixture, 'field-a')).toBeDefined();
            expect(field(fixture, 'field-b')).toBeDefined();
            expect(field(fixture, 'field-c')).toBeUndefined();
            expect(panels(fixture)).toHaveLength(2);
        });

        it('SC-UKV-950 — без входа тело ушедшей вкладки уничтожается, как прежде', (): void => {
            const fixture: THostFixture = setup(false);
            const typed: HTMLInputElement | undefined = field(fixture, 'field-a');

            pick(fixture, 'b');

            expect(field(fixture, 'field-a')).toBeUndefined();
            pick(fixture, 'a');
            expect(field(fixture, 'field-a')).not.toBe(typed);
            expect(panels(fixture)).toHaveLength(1);
        });

        it('SC-UKV-950 — скрытое тело не рисуется: своё display панели сильнее правила браузера', (): void => {
            const css: string = sass.compile(join(__dirname, 'rt-tabs.component.scss')).css.replace(/\s+/g, ' ');

            expect(css).toContain('.rt-tabs__content--idle { display: none');
        });
    });

    describe('SC-UKV-951 — при сохранении тел уходит живая панель', (): void => {
        it('SC-UKV-951 — уходит то же тело, а после конца движения оно остаётся скрытым', (): void => {
            const fixture: THostFixture = setup(true, 500);
            const typed: HTMLInputElement | undefined = field(fixture, 'field-a');

            pick(fixture, 'b');

            const leaving: HTMLElement | null = panelOf(field(fixture, 'field-a'));
            expect(field(fixture, 'field-a')).toBe(typed);
            expect(classesOf(leaving)).toEqual(expect.arrayContaining(['rt-tabs__content--leaving', 'rt-tabs__content--shift--forward']));
            expect(leaving?.hidden).toBe(false);
            expect(classesOf(panelOf(field(fixture, 'field-b')))).toContain('rt-tabs__content--entering');

            leaving?.dispatchEvent(new Event('animationend', { bubbles: true }));
            fixture.detectChanges();

            expect(field(fixture, 'field-a')).toBe(typed);
            expect(panelOf(typed)?.hidden).toBe(true);
            expect(classesOf(panelOf(field(fixture, 'field-b')))).not.toContain('rt-tabs__content--entering');
        });
    });
});
