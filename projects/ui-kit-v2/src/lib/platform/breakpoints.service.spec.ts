import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { WINDOW } from '@rt-tools/core';

import { BreakpointsService, rtNarrowByWidth } from './breakpoints.service';

/** Двойник наблюдателя размера: в jsdom его нет. Смена ширины места подаётся вызовом `resize`. */
class ResizeDouble {
    public static last: ResizeDouble | null = null;

    constructor(public readonly callback: ResizeObserverCallback) {
        ResizeDouble.last = this;
    }

    public observe(): void {}

    public unobserve(): void {}

    public resize(): void {
        this.callback([], this as unknown as ResizeObserver);
    }
}

/** Окно отвечает на запросы ширины одним признаком: узкое оно или нет. */
class ObserverDouble {
    public readonly narrowWindow: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    public observe(): Observable<BreakpointState> {
        return new Observable<BreakpointState>((subscriber): (() => void) => {
            const watch: Subscription = this.narrowWindow.subscribe((matches: boolean): void =>
                subscriber.next({ matches, breakpoints: {} })
            );
            return (): void => watch.unsubscribe();
        });
    }
}

function place(width: number): HTMLElement {
    const element: HTMLElement = document.createElement('div');
    element.getBoundingClientRect = (): DOMRect => ({ width }) as DOMRect;
    return element;
}

function setup(withResize: boolean = true): { service: BreakpointsService; observer: ObserverDouble } {
    const observer: ObserverDouble = new ObserverDouble();
    TestBed.configureTestingModule({
        providers: [
            { provide: BreakpointObserver, useValue: observer },
            { provide: WINDOW, useValue: withResize ? { ResizeObserver: ResizeDouble } : {} },
        ],
    });
    return { service: TestBed.inject(BreakpointsService), observer };
}

describe('rtNarrowByWidth', (): void => {
    it('SC-UKV-876: место уже порога даёт узкий вид при широком окне', (): void => {
        expect(rtNarrowByWidth(900, false)).toBe(true);
        expect(rtNarrowByWidth(1080, false)).toBe(true);
        expect(rtNarrowByWidth(1081, true)).toBe(false);
    });

    it('SC-UKV-878: без места вид считается от окна', (): void => {
        expect(rtNarrowByWidth(null, true)).toBe(true);
        expect(rtNarrowByWidth(null, false)).toBe(false);
    });
});

describe('BreakpointsService', (): void => {
    it('SC-UKV-876: объявленное место решает узкий вид и следит за своей шириной', (): void => {
        const { service } = setup();
        const element: HTMLElement = place(1200);

        service.registerPlace(element);
        expect(service.narrow()).toBe(false);

        element.getBoundingClientRect = (): DOMRect => ({ width: 900 }) as DOMRect;
        ResizeDouble.last?.resize();
        expect(service.narrow()).toBe(true);
    });

    it('SC-UKV-878: без места и без наблюдателя размера вид считается от окна', (): void => {
        const { service, observer } = setup(false);

        service.registerPlace(place(900));
        expect(service.narrow()).toBe(false);

        observer.narrowWindow.next(true);
        expect(service.narrow()).toBe(true);
    });

    it('SC-UKV-879: снятое место возвращает ответ окну', (): void => {
        const { service } = setup();

        const release: () => void = service.registerPlace(place(900));
        expect(service.narrow()).toBe(true);

        release();
        expect(service.narrow()).toBe(false);
    });

    it('SC-UKV-880: окна поверх экрана отвечают по окну и при узком месте', (): void => {
        const { service, observer } = setup();

        service.registerPlace(place(900));
        expect(service.narrow()).toBe(true);
        expect(service.viewportNarrow()).toBe(false);

        observer.narrowWindow.next(true);
        expect(service.viewportNarrow()).toBe(true);
    });
});
