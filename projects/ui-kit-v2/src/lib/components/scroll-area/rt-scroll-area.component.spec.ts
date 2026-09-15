import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtScrollAreaComponent } from './rt-scroll-area.component';
import { RtScrollAreaContentDirective, RtScrollAreaFooterDirective, RtScrollAreaHeaderDirective } from './rt-scroll-area.directives';

/** Части подаются шаблонами, как у потребителя, и каждая включается своим условием. */
@Component({
    selector: 'rt-scroll-area-host',
    template: `
        <rt-scroll-area>
            @if (hasHeader) {
                <ng-container *rtScrollAreaHeader><span>шапка</span></ng-container>
            }
            @if (hasContent) {
                <ng-container *rtScrollAreaContent><span>тело</span></ng-container>
            }
            @if (hasFooter) {
                <ng-container *rtScrollAreaFooter><span>подвал</span></ng-container>
            }
        </rt-scroll-area>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtScrollAreaComponent, RtScrollAreaHeaderDirective, RtScrollAreaContentDirective, RtScrollAreaFooterDirective],
})
class ScrollAreaHostComponent {
    public hasHeader: boolean = true;
    public hasContent: boolean = true;
    public hasFooter: boolean = true;
}

/** Область с признаком: подвал подаётся по условию — подъём полосы считается от него. */
@Component({
    selector: 'rt-scroll-area-hint-host',
    template: `
        <rt-scroll-area [isScrollHintShown]="isScrollHintShown">
            <ng-container *rtScrollAreaContent><span>тело</span></ng-container>
            @if (hasFooter) {
                <ng-container *rtScrollAreaFooter><span>подвал</span></ng-container>
            }
        </rt-scroll-area>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtScrollAreaComponent, RtScrollAreaContentDirective, RtScrollAreaFooterDirective],
})
class ScrollAreaHintHostComponent {
    public isScrollHintShown: boolean = true;
    public hasFooter: boolean = false;
}

interface ISizes {
    scrollHeight: number;
    clientHeight: number;
    scrollTop: number;
}

/** Высоты в спеке нулевые — разметка не рисуется. Они ставятся прямо на узле тела. */
function drive(fixture: ComponentFixture<unknown>, sizes: ISizes): HTMLElement {
    const body: HTMLElement = qa(fixture, 'scroll-area-body')?.nativeElement as HTMLElement;

    Object.defineProperty(body, 'scrollHeight', { value: sizes.scrollHeight, configurable: true });
    Object.defineProperty(body, 'clientHeight', { value: sizes.clientHeight, configurable: true });
    body.scrollTop = sizes.scrollTop;
    body.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    return body;
}

function hintSetup(sizes: ISizes, patch: Partial<ScrollAreaHintHostComponent> = {}): ComponentFixture<ScrollAreaHintHostComponent> {
    const fixture: ComponentFixture<ScrollAreaHintHostComponent> = createRtFixture(
        ScrollAreaHintHostComponent,
        {},
        { skipInitialDetect: true }
    );

    Object.assign(fixture.componentInstance, patch);
    fixture.detectChanges();
    drive(fixture, sizes);

    return fixture;
}

describe('RtScrollAreaComponent', (): void => {
    describe('части области', (): void => {
        it('SC-UKV-148 — подано одно тело: ни шапки, ни подвала нет вовсе', (): void => {
            const fixture: ComponentFixture<ScrollAreaHostComponent> = createRtFixture(
                ScrollAreaHostComponent,
                {},
                { skipInitialDetect: true }
            );

            Object.assign(fixture.componentInstance, { hasHeader: false, hasFooter: false });
            fixture.detectChanges();

            expect(qa(fixture, 'scroll-area-body')).not.toBeNull();
            expect(qa(fixture, 'scroll-area-header')).toBeNull();
            expect(qa(fixture, 'scroll-area-footer')).toBeNull();
        });

        it('SC-UKV-149 — три части стоят сверху вниз, и содержимое доезжает до своей', (): void => {
            const fixture: ComponentFixture<ScrollAreaHostComponent> = createRtFixture(ScrollAreaHostComponent);
            const root: HTMLElement = el(fixture, 'rt-scroll-area')?.nativeElement as HTMLElement;
            const order: string[] = Array.from(root.querySelectorAll('[qa-dataid]')).map(
                (node: Element): string => node.getAttribute('qa-dataid') ?? ''
            );

            expect(order).toEqual(['scroll-area-header', 'scroll-area-body', 'scroll-area-footer']);
            expect(textOf(qa(fixture, 'scroll-area-header'))).toBe('шапка');
            expect(textOf(qa(fixture, 'scroll-area-body'))).toBe('тело');
            expect(textOf(qa(fixture, 'scroll-area-footer'))).toBe('подвал');
        });
    });

    describe('признак непоказанного снизу', (): void => {
        it('SC-UKV-151 — без входа признака нет и при непоказанном снизу', (): void => {
            const fixture: ComponentFixture<ScrollAreaHintHostComponent> = hintSetup(
                { scrollHeight: 600, clientHeight: 200, scrollTop: 0 },
                { isScrollHintShown: false }
            );

            expect(qa(fixture, 'scroll-area-scroll-hint')).toBeNull();
        });

        it('SC-UKV-152 — прокручено до низа: признака нет; до середины: признак на месте', (): void => {
            expect(qa(hintSetup({ scrollHeight: 600, clientHeight: 200, scrollTop: 400 }), 'scroll-area-scroll-hint')).toBeNull();
            expect(qa(hintSetup({ scrollHeight: 600, clientHeight: 200, scrollTop: 150 }), 'scroll-area-scroll-hint')).not.toBeNull();
        });

        it('SC-UKV-152 — содержимое влезло целиком: признака нет вовсе', (): void => {
            expect(qa(hintSetup({ scrollHeight: 200, clientHeight: 200, scrollTop: 0 }), 'scroll-area-scroll-hint')).toBeNull();
        });

        it('SC-UKV-156 — подпись значка приходит из набора кита', (): void => {
            const fixture: ComponentFixture<ScrollAreaHintHostComponent> = hintSetup({
                scrollHeight: 600,
                clientHeight: 200,
                scrollTop: 0,
            });
            const icon: HTMLElement = qa(fixture, 'scroll-area-scroll-hint-icon')?.nativeElement as HTMLElement;

            expect(icon.getAttribute('aria-label')).toBe('Scroll down');
        });
    });

    describe('подъём полосы', (): void => {
        it('SC-UKV-153 — с подвалом полоса поднята на его высоту без верхнего отступа', (): void => {
            const fixture: ComponentFixture<ScrollAreaHintHostComponent> = createRtFixture(
                ScrollAreaHintHostComponent,
                {},
                { skipInitialDetect: true }
            );

            fixture.componentInstance.hasFooter = true;
            fixture.detectChanges();

            const footer: HTMLElement = qa(fixture, 'scroll-area-footer')?.nativeElement as HTMLElement;

            Object.defineProperty(footer, 'offsetHeight', { value: 48, configurable: true });
            footer.style.paddingTop = '16px';

            drive(fixture, { scrollHeight: 600, clientHeight: 200, scrollTop: 0 });

            const hint: HTMLElement = qa(fixture, 'scroll-area-scroll-hint')?.nativeElement as HTMLElement;

            expect(hint.style.bottom).toBe('32px');
        });

        it('SC-UKV-153 — без подвала полоса стоит у самого низа', (): void => {
            const fixture: ComponentFixture<ScrollAreaHintHostComponent> = hintSetup({
                scrollHeight: 600,
                clientHeight: 200,
                scrollTop: 0,
            });
            const hint: HTMLElement = qa(fixture, 'scroll-area-scroll-hint')?.nativeElement as HTMLElement;

            expect(hint.style.bottom).toBe('0px');
        });
    });

    describe('нажатие на значок', (): void => {
        it('SC-UKV-154 — уводит тело к самому низу и не уходит в содержимое под ним', (): void => {
            const fixture: ComponentFixture<ScrollAreaHintHostComponent> = hintSetup({
                scrollHeight: 600,
                clientHeight: 200,
                scrollTop: 0,
            });
            const body: HTMLElement = qa(fixture, 'scroll-area-body')?.nativeElement as HTMLElement;
            const scrollTo: jest.Mock = jest.fn();

            body.scrollTo = scrollTo;

            const icon: HTMLElement = qa(fixture, 'scroll-area-scroll-hint-icon')?.nativeElement as HTMLElement;
            const click: MouseEvent = new MouseEvent('click', { bubbles: true, cancelable: true });

            icon.dispatchEvent(click);
            fixture.detectChanges();

            expect(scrollTo).toHaveBeenCalledWith({ top: 600, behavior: 'smooth' });
            expect(click.defaultPrevented).toBe(true);
        });
    });

    describe('признак считается без прокрутки', (): void => {
        /**
         * Наблюдателя за размером в среде спеки нет вовсе, поэтому он подменяется: обратный вызов
         * хранится и зовётся руками. Так проверяется связка целиком — область обязана пересчитать
         * признак от изменения размера, а не только от движения руки.
         */
        let notifySize: (() => void) | null = null;

        beforeEach((): void => {
            notifySize = null;
            (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
                constructor(callback: () => void) {
                    notifySize = callback;
                }

                public observe(): void {}

                public disconnect(): void {}
            };
        });

        afterEach((): void => {
            delete (globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver;
        });

        it('SC-UKV-150 — список не влез с первого показа: признак встаёт без движения руки', (): void => {
            const fixture: ComponentFixture<ScrollAreaHintHostComponent> = createRtFixture(ScrollAreaHintHostComponent);
            const body: HTMLElement = qa(fixture, 'scroll-area-body')?.nativeElement as HTMLElement;

            Object.defineProperty(body, 'scrollHeight', { value: 600, configurable: true });
            Object.defineProperty(body, 'clientHeight', { value: 200, configurable: true });

            // Размер тела стал известен — наблюдатель сообщает об этом, события прокрутки не было.
            notifySize?.();
            fixture.detectChanges();

            expect(qa(fixture, 'scroll-area-scroll-hint')).not.toBeNull();
        });
    });
});
