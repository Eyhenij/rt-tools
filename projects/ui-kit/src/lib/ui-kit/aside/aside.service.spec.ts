import { Overlay } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';

import { RtAsideService } from './aside.service';
import { ASIDE_REF, AsideRef, IAsideConfig } from './aside.types';

@Component({ selector: 'rtui-aside-test-content', template: '', standalone: true })
class TestContentComponent {}

/**
 * Двойник оверлея: настоящий CDK Overlay в среде без браузера поднимается, но нажатия и клики
 * по подложке в него приходится доставлять руками — здесь это два потока, которыми правит сама
 * спека.
 */
class OverlayStub {
    public readonly keydown: Subject<KeyboardEvent> = new Subject<KeyboardEvent>();
    public readonly backdrop: Subject<MouseEvent> = new Subject<MouseEvent>();
    public detached: boolean = false;
    public disposed: boolean = false;
    /** Ссылка шторки, отданная содержимому: ею потребитель закрывает панель своим кодом. */
    public asideRef: AsideRef<unknown, unknown> | null = null;

    public keydownEvents(): Subject<KeyboardEvent> {
        return this.keydown;
    }

    public backdropClick(): Subject<MouseEvent> {
        return this.backdrop;
    }

    public attach(portal: { injector?: { get: (token: unknown) => AsideRef<unknown, unknown> } }): {
        instance: { startExitAnimation: () => void };
    } {
        this.asideRef = portal.injector?.get(ASIDE_REF) ?? null;

        return { instance: { startExitAnimation: (): void => {} } };
    }

    public detach(): void {
        this.detached = true;
    }

    public dispose(): void {
        this.disposed = true;
    }
}

describe('RtAsideService', () => {
    let overlay: OverlayStub;
    let service: RtAsideService;

    beforeEach(() => {
        jest.useFakeTimers();
        overlay = new OverlayStub();

        TestBed.configureTestingModule({
            providers: [
                RtAsideService,
                provideRouter([]),
                {
                    provide: Overlay,
                    useValue: {
                        create: (): OverlayStub => overlay,
                        scrollStrategies: { block: (): unknown => ({}) },
                        position: (): unknown => ({ global: (): unknown => ({ left: (): unknown => ({}), right: (): unknown => ({}) }) }),
                    },
                },
            ],
        });

        service = TestBed.inject(RtAsideService);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    function open(config?: IAsideConfig): { closed: boolean; ref: AsideRef<null, null> | null } {
        const state: { closed: boolean; ref: AsideRef<null, null> | null } = { closed: false, ref: null };

        service.Open<TestContentComponent, null, null>(TestContentComponent, 'right', null, config).subscribe({
            complete: (): void => {
                state.closed = true;
            },
        });

        return state;
    }

    it('SC-UK-09: Esc открытую шторку не закрывает', () => {
        const state: { closed: boolean } = open();

        overlay.keydown.next(new KeyboardEvent('keydown', { key: 'Escape' }));
        jest.advanceTimersByTime(400);

        expect(state.closed).toBe(false);
        expect(overlay.detached).toBe(false);
    });

    it('SC-UK-10: разрешённое настройкой закрытие клавишей работает', () => {
        open({ closeOnEscape: true });

        overlay.keydown.next(new KeyboardEvent('keydown', { key: 'Escape' }));
        jest.advanceTimersByTime(400);

        expect(overlay.detached).toBe(true);
    });

    it('SC-UK-11: клик по подложке закрывает шторку по-прежнему', () => {
        open();

        overlay.backdrop.next(new MouseEvent('click'));
        jest.advanceTimersByTime(400);

        expect(overlay.detached).toBe(true);
    });

    it('SC-UK-12: программное закрытие настройкой не гасится', () => {
        const state: { closed: boolean } = open();

        // Потребитель закрывает шторку своим кодом — через ссылку, отданную содержимому.
        overlay.asideRef?.close();
        jest.advanceTimersByTime(400);

        expect(state.closed).toBe(true);
        expect(overlay.detached).toBe(true);
    });
});
