import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
    RtuiScrollableContainerComponent,
    RtuiScrollableContainerContentDirective,
    RtuiScrollableContainerFooterDirective,
    RtuiScrollableContainerHeaderDirective,
} from './scrollable-container.component';

/** Части подаются шаблонами, как у приложения, и включаются условием вокруг каждой. */
@Component({
    template: `
        <rtui-scrollable>
            @if (hasHeader) {
                <ng-container *rtuiScrollableHeader><span>шапка</span></ng-container>
            }
            @if (hasContent) {
                <ng-container *rtuiScrollableContent><span>тело</span></ng-container>
            }
            @if (hasFooter) {
                <ng-container *rtuiScrollableFooter><span>подвал</span></ng-container>
            }
        </rtui-scrollable>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtuiScrollableContainerComponent,
        RtuiScrollableContainerHeaderDirective,
        RtuiScrollableContainerContentDirective,
        RtuiScrollableContainerFooterDirective,
    ],
})
class HostComponent {
    public hasHeader: boolean = true;
    public hasContent: boolean = true;
    public hasFooter: boolean = true;
}

/** Область с включённым признаком прокрутки: тело подаётся одно, шапка и подвал ей не нужны. */
@Component({
    template: `
        <rtui-scrollable [isScrollHintShown]="isScrollHintShown">
            <ng-container *rtuiScrollableContent><span>тело</span></ng-container>
        </rtui-scrollable>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtuiScrollableContainerComponent, RtuiScrollableContainerContentDirective],
})
class HintHostComponent {
    public isScrollHintShown: boolean = true;
}

describe('RtuiScrollableContainerComponent — сборка частей', () => {
    function setup(patch: Partial<HostComponent> = {}): ComponentFixture<HostComponent> {
        TestBed.configureTestingModule({ imports: [HostComponent] });

        const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);

        Object.assign(fixture.componentInstance, patch);
        fixture.detectChanges();

        return fixture;
    }

    function parts(fixture: ComponentFixture<HostComponent>): string[] {
        return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[class^="rtui-scrollable__"]')).map(
            (one: Element) => one.className
        );
    }

    it('три поданные части идут сверху вниз: шапка, тело, подвал', () => {
        expect(parts(setup())).toEqual(['rtui-scrollable__header', 'rtui-scrollable__content', 'rtui-scrollable__footer']);
    });

    it('подано одно тело — ни шапки, ни подвала нет вовсе', () => {
        expect(parts(setup({ hasHeader: false, hasFooter: false }))).toEqual(['rtui-scrollable__content']);
    });

    it('шапка с телом без подвала', () => {
        expect(parts(setup({ hasFooter: false }))).toEqual(['rtui-scrollable__header', 'rtui-scrollable__content']);
    });

    it('содержимое частей доезжает до разметки в том же порядке', () => {
        const texts: string[] = Array.from(
            (setup().nativeElement as HTMLElement).querySelectorAll('[class^="rtui-scrollable__"] span')
        ).map((one: Element) => one.textContent ?? '');

        expect(texts).toEqual(['шапка', 'тело', 'подвал']);
    });
});

describe('RtuiScrollableContainerComponent — SC-UK-42 признак непоказанного снизу', () => {
    /** Высоты в спеке нулевые: разметка не рисуется. Они задаются прямо на узле тела. */
    function setup(
        sizes: { scrollHeight: number; clientHeight: number; scrollTop: number },
        isShown: boolean = true
    ): ComponentFixture<HintHostComponent> {
        TestBed.configureTestingModule({ imports: [HintHostComponent] });

        const fixture: ComponentFixture<HintHostComponent> = TestBed.createComponent(HintHostComponent);

        fixture.componentInstance.isScrollHintShown = isShown;
        fixture.detectChanges();

        const body: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('.rtui-scrollable__content') as HTMLElement;

        Object.defineProperty(body, 'scrollHeight', { value: sizes.scrollHeight, configurable: true });
        Object.defineProperty(body, 'clientHeight', { value: sizes.clientHeight, configurable: true });
        body.scrollTop = sizes.scrollTop;
        body.dispatchEvent(new Event('scroll'));
        fixture.detectChanges();

        return fixture;
    }

    function hint(fixture: ComponentFixture<HintHostComponent>): HTMLElement | null {
        return (fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="scrollable-scroll-hint"]');
    }

    it('содержимое выше окна области — признак показан', () => {
        expect(hint(setup({ scrollHeight: 600, clientHeight: 200, scrollTop: 0 }))).not.toBeNull();
    });

    it('содержимое влезло целиком — признака нет вовсе', () => {
        expect(hint(setup({ scrollHeight: 200, clientHeight: 200, scrollTop: 0 }))).toBeNull();
    });

    it('прокручено до конца — признак снят', () => {
        expect(hint(setup({ scrollHeight: 600, clientHeight: 200, scrollTop: 400 }))).toBeNull();
    });

    it('прокручено до середины — признак на месте', () => {
        expect(hint(setup({ scrollHeight: 600, clientHeight: 200, scrollTop: 150 }))).not.toBeNull();
    });

    it('вход выключен — признака нет и при непоказанном снизу', () => {
        expect(hint(setup({ scrollHeight: 600, clientHeight: 200, scrollTop: 0 }, false))).toBeNull();
    });

    it('у значка есть подпись про прокрутку', () => {
        const node: HTMLElement | null = hint(setup({ scrollHeight: 600, clientHeight: 200, scrollTop: 0 }));

        expect(node?.getAttribute('aria-label')).toBe('Scroll down');
    });
});

describe('RtuiScrollableContainerComponent — SC-UK-42 признак считается без прокрутки', () => {
    /**
     * Наблюдателя за размером в среде спеки нет вовсе, поэтому он подменяется: колбэк хранится и
     * зовётся руками. Так проверяется связка целиком — область обязана пересчитать признак от
     * изменения размера, а не только от движения руки.
     */
    let notifySize: (() => void) | null = null;

    beforeEach(() => {
        notifySize = null;
        (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
            constructor(callback: () => void) {
                notifySize = callback;
            }

            public observe(): void {}

            public disconnect(): void {}
        };
    });

    afterEach(() => {
        delete (globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver;
    });

    it('список не влез с первого показа — признак встаёт без единого движения руки', () => {
        TestBed.configureTestingModule({ imports: [HintHostComponent] });

        const fixture: ComponentFixture<HintHostComponent> = TestBed.createComponent(HintHostComponent);

        fixture.detectChanges();

        const body: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('.rtui-scrollable__content') as HTMLElement;

        Object.defineProperty(body, 'scrollHeight', { value: 600, configurable: true });
        Object.defineProperty(body, 'clientHeight', { value: 200, configurable: true });

        // Размер тела стал известен — наблюдатель сообщает об этом, события прокрутки не было.
        notifySize?.();
        fixture.detectChanges();

        expect((fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="scrollable-scroll-hint"]')).not.toBeNull();
    });
});

describe('RtuiScrollableContainerComponent — SC-UK-44 нажатие на значок уводит список вниз', () => {
    function setup(): { fixture: ComponentFixture<HintHostComponent>; body: HTMLElement } {
        TestBed.configureTestingModule({ imports: [HintHostComponent] });

        const fixture: ComponentFixture<HintHostComponent> = TestBed.createComponent(HintHostComponent);

        fixture.detectChanges();

        const body: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('.rtui-scrollable__content') as HTMLElement;

        Object.defineProperty(body, 'scrollHeight', { value: 600, configurable: true });
        Object.defineProperty(body, 'clientHeight', { value: 200, configurable: true });
        body.dispatchEvent(new Event('scroll'));
        fixture.detectChanges();

        return { fixture, body };
    }

    it('нажатие уводит список к самому низу', () => {
        const { fixture, body }: { fixture: ComponentFixture<HintHostComponent>; body: HTMLElement } = setup();
        const asked: { top?: number; behavior?: string }[] = [];

        body.scrollTo = ((options: { top?: number; behavior?: string }): void => {
            asked.push(options);
        }) as typeof body.scrollTo;

        const icon: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector(
            '[qa-dataid="scrollable-scroll-hint"] mat-icon'
        ) as HTMLElement;

        icon.click();

        expect(asked).toEqual([{ top: 600, behavior: 'smooth' }]);
    });

    it('нажатие на значок не уходит в список под ним', () => {
        const { fixture, body }: { fixture: ComponentFixture<HintHostComponent>; body: HTMLElement } = setup();

        // Прокрутки в среде спеки нет вовсе, а проверяется здесь не она: без подмены обработчик
        // падает на первой же строке, и до сравнения дело не доходит.
        body.scrollTo = (): void => {};

        const icon: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector(
            '[qa-dataid="scrollable-scroll-hint"] mat-icon'
        ) as HTMLElement;
        const event: MouseEvent = new MouseEvent('click', { bubbles: true, cancelable: true });

        icon.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });
});
