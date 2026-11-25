import { join } from 'node:path';

import { ApplicationRef, createEnvironmentInjector, DestroyRef, EnvironmentInjector, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as sass from 'sass';

import { rtMotionDurationMs, RtSheetScreens, rtSwitchSheetScreen } from './rt-bottom-sheet-screens';

/** Правило второго экрана из собранных стилей шторки. */
function nestedPanelRule(): string {
    const css: string = sass.compile(join(__dirname, 'rt-bottom-sheet.component.scss'), { style: 'expanded' }).css;
    const from: number = css.indexOf('.rt-bottom-sheet--nested > .rt-bottom-sheet__panel {');

    return css.slice(from, css.indexOf('}', from));
}

/** Шторка с панелью нужной высоты; анимации частей пишутся в `calls`. */
function sheet(height: number, calls: Array<{ node: string; frames: Keyframe[]; options: KeyframeAnimationOptions }>): HTMLElement {
    const host: HTMLElement = document.createElement('rt-bottom-sheet');
    host.innerHTML = `
        <div class="rt-bottom-sheet__panel">
            <div class="rt-bottom-sheet__handle"></div>
            <div class="rt-bottom-sheet__header"></div>
            <div class="rt-bottom-sheet__body"></div>
            <div class="rt-bottom-sheet__footer"></div>
        </div>`;
    host.style.setProperty('--rt-bottom-sheet-transition-duration', '200ms');
    host.querySelectorAll<HTMLElement>('div').forEach((node: HTMLElement): void => {
        Object.defineProperty(node, 'animate', {
            value: (frames: Keyframe[], options: KeyframeAnimationOptions): void => {
                calls.push({ node: node.className, frames, options });
            },
        });
    });
    const panel: HTMLElement = host.querySelector('.rt-bottom-sheet__panel') as HTMLElement;
    jest.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ height } as DOMRect);
    document.body.appendChild(host);

    return host;
}

function reducedMotion(reduced: boolean): void {
    Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        value: (query: string): MediaQueryList => ({ matches: reduced && query.includes('reduced-motion') }) as MediaQueryList,
    });
}

describe('Экраны шторки — высота второго экрана и смена экранов', (): void => {
    afterEach((): void => {
        document.body.innerHTML = '';
        Reflect.deleteProperty(window, 'matchMedia');
    });

    it('SC-UKV-1867 — второй экран не ниже первого и растёт по содержимому до предела шторки во всю высоту', (): void => {
        const rule: string = nestedPanelRule();

        expect(rule).toContain('min-height: min(var(--rt-bottom-sheet-nested-height), 100% - var(--rt-space-2) - var(--rt-space-1))');
        // Высота не задана: панель растёт по содержимому; предел — свой предел панели, полоса 12 сверху.
        expect(rule).not.toMatch(/(^|[^-])height:/m);
        expect(rule).not.toContain('max-height');
    });

    it('SC-UKV-1867 — переход ко второму экрану: высота от первого к своей и въезд содержимого справа', (): void => {
        reducedMotion(false);
        const calls: Array<{ node: string; frames: Keyframe[]; options: KeyframeAnimationOptions }> = [];

        rtSwitchSheetScreen(sheet(520, calls), 346, 1);

        expect(calls[0]).toEqual({
            node: 'rt-bottom-sheet__panel',
            frames: [{ height: '346px' }, { height: '520px' }],
            options: { duration: 200, easing: 'ease' },
        });
        expect(calls.slice(1).map((call: { node: string }): string => call.node)).toEqual([
            'rt-bottom-sheet__header',
            'rt-bottom-sheet__body',
            'rt-bottom-sheet__footer',
        ]);
        expect(calls[1].frames[0]).toEqual({ opacity: 0, transform: 'translateX(16px)' });
    });

    it('SC-UKV-1867 — возврат к первому экрану идёт от высоты второго, содержимое въезжает слева', (): void => {
        reducedMotion(false);
        const calls: Array<{ node: string; frames: Keyframe[]; options: KeyframeAnimationOptions }> = [];

        rtSwitchSheetScreen(sheet(346, calls), 520, -1);

        expect(calls[0].frames).toEqual([{ height: '520px' }, { height: '346px' }]);
        expect(calls[1].frames[0]).toEqual({ opacity: 0, transform: 'translateX(-16px)' });
    });

    it('SC-UKV-1867 — человек убавил движение: экраны меняются без перехода', (): void => {
        reducedMotion(true);
        const calls: Array<{ node: string; frames: Keyframe[]; options: KeyframeAnimationOptions }> = [];

        rtSwitchSheetScreen(sheet(520, calls), 346, 1);

        expect(calls).toEqual([]);
    });

    it('SC-UKV-1867 — страница ушла вместе с обоими экранами: первый экран не меняется и не падает', (): void => {
        const application: EnvironmentInjector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
        // Окружение шторки — дочернее, как у оверлея: оно стоит, когда корень приложения уже снят.
        const overlay: EnvironmentInjector = createEnvironmentInjector([], application);
        const view: Injector = Injector.create({
            providers: [
                { provide: DestroyRef, useValue: { destroyed: false, onDestroy: (): (() => void) => (): void => undefined } },
                { provide: ApplicationRef, useValue: { injector: application } },
            ],
            parent: overlay,
        });
        const under: RtSheetScreens = new RtSheetScreens(sheet(346, []), view);
        // Сама шторка и её оверлей ещё стоят, а приложение уже снято: так уходит страница целиком.
        application.destroy();

        expect((): void => under.switchFrom(520, -1)).not.toThrow();
    });

    it('SC-UKV-1867 — длительность смены — длительность выезда шторки', (): void => {
        expect(rtMotionDurationMs('200ms')).toBe(200);
        expect(rtMotionDurationMs(' 0.2s')).toBe(200);
        expect(rtMotionDurationMs('')).toBe(200);
    });
});
