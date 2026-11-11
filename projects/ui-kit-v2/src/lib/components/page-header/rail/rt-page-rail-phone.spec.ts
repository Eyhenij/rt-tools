import { signal, ApplicationRef, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { WINDOW } from '@rt-tools/core';

import { createRtFixture, qa, qaAll } from '../../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../../platform/breakpoints.service';
import { RtPageHeaderComponent } from '../rt-page-header.component';
import { IRtPageHeader } from '../rt-page-header.model';

const ITEMS: ReadonlyArray<IRtPageHeader.Item> = [
    { id: 'home', label: 'Главная', icon: 'book', route: '/home' },
    { id: 'plain', label: 'Отчёты', route: '/reports' },
    {
        id: 'money',
        label: 'Финансы',
        icon: 'book',
        columns: [{ id: 'c', groups: [{ id: 'g', label: 'Счета', items: [{ id: 'all', label: 'Все счета', route: '/all' }] }] }],
    },
];

const narrow: WritableSignal<boolean> = signal<boolean>(true);

/** Двойник ширины экрана: тест сам переводит его через порог узкого. */
class BreakpointsDouble {
    public readonly narrow: WritableSignal<boolean> = narrow;
}

class ObserverDouble {
    public observe(): void {}

    public disconnect(): void {}
}

/** Окно с наблюдателями-пустышками и настоящими таймерами: таймер ухода курсора крутит jest. */
function windowDouble(): Window & typeof globalThis {
    return Object.assign(Object.create(window) as Window & typeof globalThis, {
        IntersectionObserver: ObserverDouble,
        ResizeObserver: ObserverDouble,
        getComputedStyle: (): Partial<CSSStyleDeclaration> => ({ columnGap: '4px' }),
        setTimeout: (handler: () => void, delay: number): number => window.setTimeout(handler, delay),
        clearTimeout: (id: number): void => window.clearTimeout(id),
    });
}

function render(fixture: ComponentFixture<RtPageHeaderComponent>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
}

function setup(): ComponentFixture<RtPageHeaderComponent> {
    const fixture: ComponentFixture<RtPageHeaderComponent> = createRtFixture(
        RtPageHeaderComponent,
        { items: ITEMS, layout: 'vertical', user: { name: 'Иван' } },
        {
            providers: [
                provideRouter([]),
                { provide: WINDOW, useFactory: windowDouble },
                { provide: BreakpointsService, useClass: BreakpointsDouble },
            ],
        }
    );
    render(fixture);
    return fixture;
}

function element(fixture: ComponentFixture<RtPageHeaderComponent>, id: string): HTMLElement {
    return qa(fixture, id)?.nativeElement as HTMLElement;
}

function railItem(fixture: ComponentFixture<RtPageHeaderComponent>, id: string): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`[qa-dataid="rail-item"][data-id="${id}"]`) as HTMLElement;
}

describe('rt-page-rail — телефон и закрытие панели', (): void => {
    afterEach((): void => {
        narrow.set(true);
        jest.useRealTimers();
    });

    it('SC-UKV-1226 — the burger opens the column as a dialog with focus inside, and the backdrop returns focus', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();
        const burger: HTMLElement = element(fixture, 'rail-burger');

        burger.focus();
        burger.click();
        render(fixture);

        const column: HTMLElement | null = element(fixture, 'rail-phone-menu').querySelector('[role="dialog"]');
        expect(column?.getAttribute('aria-modal')).toBe('true');
        expect(column?.contains(document.activeElement)).toBe(true);

        element(fixture, 'rail-phone-backdrop').click();
        render(fixture);

        expect(qa(fixture, 'rail-phone-menu')).toBeNull();
        expect(document.activeElement).toBe(burger);
    });

    it('SC-UKV-1226 — a screen widened past the narrow threshold closes the column', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

        element(fixture, 'rail-burger').click();
        render(fixture);
        expect(qa(fixture, 'rail-phone-menu')).not.toBeNull();

        narrow.set(false);
        render(fixture);
        narrow.set(true);
        render(fixture);

        expect(qa(fixture, 'rail-phone-menu')).toBeNull();
    });

    it('SC-UKV-1227 — a section without an icon shows the first letter of its name', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

        expect(qaAll(fixture, 'rail-letter')).toHaveLength(1);
        expect(railItem(fixture, 'plain').textContent?.trim()).toBe('О');
    });

    it('SC-UKV-1192 — a click outside the rail closes the open panel', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

        railItem(fixture, 'money').click();
        render(fixture);
        expect(qaAll(fixture, 'rail-panel')).toHaveLength(1);

        document.body.click();
        render(fixture);

        expect(qaAll(fixture, 'rail-panel')).toHaveLength(0);
    });

    it('SC-UKV-1192 — the pointer leaving the rail closes the panel after a pause, and coming back keeps it', (): void => {
        jest.useFakeTimers();
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();
        const rail: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('rt-page-rail') as HTMLElement;

        railItem(fixture, 'money').dispatchEvent(new MouseEvent('mouseenter'));
        render(fixture);
        rail.dispatchEvent(new MouseEvent('mouseleave'));
        jest.advanceTimersByTime(100);
        rail.dispatchEvent(new MouseEvent('mouseenter'));
        jest.advanceTimersByTime(200);
        render(fixture);
        expect(qaAll(fixture, 'rail-panel')).toHaveLength(1);

        rail.dispatchEvent(new MouseEvent('mouseleave'));
        jest.advanceTimersByTime(200);
        render(fixture);

        expect(qaAll(fixture, 'rail-panel')).toHaveLength(0);
    });
});
