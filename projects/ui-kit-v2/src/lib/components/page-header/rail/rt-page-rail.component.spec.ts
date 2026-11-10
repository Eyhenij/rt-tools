import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { WINDOW } from '@rt-tools/core';

import { createRtFixture, qa, qaAll } from '../../../../testing/rt-kit-testing';
import { RtPageHeaderComponent } from '../rt-page-header.component';
import { IRtPageHeader } from '../rt-page-header.model';

const ITEMS: ReadonlyArray<IRtPageHeader.Item> = [
    { id: 'home', label: 'Главная', icon: 'book', route: '/home' },
    { id: 'alarms', label: 'Заявки', icon: 'bars', unread: true },
    {
        id: 'money',
        label: 'Финансы',
        icon: 'book',
        columns: [
            {
                id: 'c',
                groups: [
                    {
                        id: 'g',
                        label: 'Счета',
                        items: [
                            { id: 'all', label: 'Все счета', route: '/all' },
                            { id: 'pay', label: 'Оплаты' },
                        ],
                    },
                ],
            },
        ],
    },
];

class ObserverDouble {
    public observe(): void {}

    public disconnect(): void {}
}

/** Двойник наблюдателя пересечения: прокрутка за верх подаётся вызовом `stick`. */
class StuckDouble extends ObserverDouble {
    public static last: StuckDouble | null = null;

    constructor(private readonly callback: IntersectionObserverCallback) {
        super();
        StuckDouble.last = this;
    }

    public stick(): void {
        const entry: IntersectionObserverEntry = { intersectionRatio: 0.97, isIntersecting: true } as IntersectionObserverEntry;
        this.callback([entry], this as unknown as IntersectionObserver);
    }
}

function windowDouble(): Window & typeof globalThis {
    return {
        IntersectionObserver: StuckDouble,
        ResizeObserver: ObserverDouble,
        getComputedStyle: (): Partial<CSSStyleDeclaration> => ({ columnGap: '4px' }),
    } as unknown as Window & typeof globalThis;
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtPageHeaderComponent> {
    return createRtFixture(
        RtPageHeaderComponent,
        { items: ITEMS, layout: 'vertical', user: { name: 'Иван' }, ...inputs },
        { providers: [provideRouter([]), { provide: WINDOW, useFactory: windowDouble }] }
    );
}

function itemOf(fixture: ComponentFixture<RtPageHeaderComponent>, id: string): HTMLElement {
    const item: DebugElement | undefined = qaAll(fixture, 'rail-item').find(
        (node: DebugElement): boolean => (node.nativeElement as HTMLElement).dataset['id'] === id
    );
    if (item === undefined) {
        throw new Error(`no rail item ${id}`);
    }
    return item.nativeElement as HTMLElement;
}

describe('rt-page-rail', (): void => {
    it('SC-UKV-1190 — the horizontal header stays by default and draws no rail', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup({ layout: 'horizontal' });

        expect(qaAll(fixture, 'rail-item')).toHaveLength(0);
        expect(qaAll(fixture, 'header-nav-item').length).toBeGreaterThan(0);
    });

    it('SC-UKV-1191 — the rail draws the same sections in the same order, with an unread mark', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();
        const ids: Array<string | undefined> = qaAll(fixture, 'rail-item').map(
            (node: DebugElement): string | undefined => (node.nativeElement as HTMLElement).dataset['id']
        );

        expect(ids).toEqual(['home', 'alarms', 'money']);
        expect(qaAll(fixture, 'rail-marker')).toHaveLength(1);
    });

    it('SC-UKV-1192 — a section with a panel opens it on hover, and a plain section closes it', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

        itemOf(fixture, 'money').dispatchEvent(new MouseEvent('mouseenter'));
        fixture.detectChanges();
        expect(qaAll(fixture, 'rail-panel-item')).toHaveLength(2);

        itemOf(fixture, 'alarms').dispatchEvent(new MouseEvent('mouseenter'));
        fixture.detectChanges();
        expect(qaAll(fixture, 'rail-panel')).toHaveLength(0);
    });

    it('SC-UKV-1192 — Escape closes the panel, and a touch opens it without hover', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

        itemOf(fixture, 'money').click();
        fixture.detectChanges();
        expect(qaAll(fixture, 'rail-panel')).toHaveLength(1);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        fixture.detectChanges();
        expect(qaAll(fixture, 'rail-panel')).toHaveLength(0);
    });

    it('SC-UKV-1215 — a second touch on the same section closes its panel', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

        itemOf(fixture, 'money').click();
        fixture.detectChanges();
        expect(qaAll(fixture, 'rail-panel')).toHaveLength(1);

        itemOf(fixture, 'money').click();
        fixture.detectChanges();
        expect(qaAll(fixture, 'rail-panel')).toHaveLength(0);
    });

    it('SC-UKV-1215 — a mouse press after hover keeps the panel open', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();
        const press: MouseEvent = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(press, 'pointerType', { value: 'mouse' });

        itemOf(fixture, 'money').dispatchEvent(new MouseEvent('mouseenter'));
        fixture.detectChanges();
        itemOf(fixture, 'money').dispatchEvent(press);
        fixture.detectChanges();

        expect(qaAll(fixture, 'rail-panel')).toHaveLength(1);
    });

    it('SC-UKV-1216 — a header turned horizontal at runtime shrinks on scroll', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup({ stickyCompact: true });
        const compact: () => boolean = (): boolean =>
            (fixture.nativeElement as HTMLElement).classList.contains('rt-page-header--is-compact');

        StuckDouble.last?.stick();
        fixture.detectChanges();
        expect(StuckDouble.last).not.toBeNull();
        expect(compact()).toBe(false);

        fixture.componentRef.setInput('layout', 'horizontal');
        fixture.detectChanges();

        expect(compact()).toBe(true);
    });

    it('SC-UKV-1192 — a plain panel item reports its click and closes the panel', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();
        const clicked: string[] = [];
        fixture.componentInstance.itemClick.subscribe((id: string): void => {
            clicked.push(id);
        });

        itemOf(fixture, 'money').click();
        fixture.detectChanges();
        const pay: DebugElement | undefined = qaAll(fixture, 'rail-panel-item').find(
            (node: DebugElement): boolean => (node.nativeElement as HTMLElement).dataset['id'] === 'pay'
        );
        (pay?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(clicked).toEqual(['pay']);
        expect(qaAll(fixture, 'rail-panel')).toHaveLength(0);
    });

    it('SC-UKV-1207 — a switched-on foot button carries its look and says it is pressed', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup({
            railActions: [
                { id: 'assistant', label: 'Ассистент', icon: 'book', active: true },
                { id: 'bell', label: 'Уведомления', icon: 'book' },
            ],
        });
        const [assistant, bell]: DebugElement[] = qaAll(fixture, 'page-action');

        expect((assistant.nativeElement as HTMLElement).classList).toContain('rt-page-actions__item--active');
        expect((assistant.nativeElement as HTMLElement).getAttribute('aria-pressed')).toBe('true');
        expect((bell.nativeElement as HTMLElement).classList).not.toContain('rt-page-actions__item--active');
        expect((bell.nativeElement as HTMLElement).hasAttribute('aria-pressed')).toBe(false);
    });

    it('SC-UKV-1193 — without a foot the rail draws neither the foot nor the profile', (): void => {
        expect(qa(setup(), 'rail-foot')).not.toBeNull();

        const fixture: ComponentFixture<RtPageHeaderComponent> = setup({ railFoot: false });
        expect(qaAll(fixture, 'rail-foot')).toHaveLength(0);
        expect(qaAll(fixture, 'page-user')).toHaveLength(0);
    });
});
