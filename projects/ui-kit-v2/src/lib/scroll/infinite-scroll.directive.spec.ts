import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { WINDOW } from '@rt-tools/core';

import { createRtFixture } from '../../testing/rt-kit-testing';
import { RtInfiniteScrollDirective } from './infinite-scroll.directive';

/**
 * Двойник наблюдателя пересечений: в среде без браузера его нет вовсе, а
 * директива только на нём и держится. Двойник помнит все свои экземпляры,
 * поэтому видно и то, что наблюдение заведено заново, и то, что старое снято.
 */
class ObserverDouble {
    public readonly observed: Element[] = [];
    public disconnected: boolean = false;

    public static readonly created: ObserverDouble[] = [];

    constructor(
        public readonly callback: IntersectionObserverCallback,
        public readonly options: IntersectionObserverInit
    ) {
        ObserverDouble.created.push(this);
    }

    public observe(target: Element): void {
        this.observed.push(target);
    }

    public disconnect(): void {
        this.disconnected = true;
    }

    /** Повторяет приход маяка в область видимости. */
    public reach(): void {
        this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
}

/** Окно отдаётся токеном — двойник ставится провайдером, а не правкой глобального объекта. */
function windowDouble(): Window & typeof globalThis {
    return { IntersectionObserver: ObserverDouble } as unknown as Window & typeof globalThis;
}

@Component({
    selector: 'rt-infinite-scroll-host',
    template: '<div rtInfiniteScroll [disabled]="disabled()" [rootMargin]="rootMargin()" (loadMore)="pages = pages + 1"></div>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtInfiniteScrollDirective],
})
class InfiniteScrollHostComponent {
    public readonly disabled: WritableSignal<boolean> = signal<boolean>(false);
    public readonly rootMargin: WritableSignal<string> = signal<string>('50%');
    public pages: number = 0;
}

function setup(): ComponentFixture<InfiniteScrollHostComponent> {
    ObserverDouble.created.length = 0;

    return createRtFixture(InfiniteScrollHostComponent, {}, { providers: [{ provide: WINDOW, useFactory: windowDouble }] });
}

function lastObserver(): ObserverDouble {
    return ObserverDouble.created[ObserverDouble.created.length - 1];
}

describe('RtInfiniteScrollDirective', (): void => {
    it('заводит наблюдение за самим маяком', (): void => {
        const fixture: ComponentFixture<InfiniteScrollHostComponent> = setup();

        expect(ObserverDouble.created.length).toBe(1);
        expect(lastObserver().observed).toEqual([fixture.debugElement.children[0].nativeElement]);
    });

    it('приход маяка в область видимости просит следующую страницу', (): void => {
        const fixture: ComponentFixture<InfiniteScrollHostComponent> = setup();

        lastObserver().reach();

        expect(fixture.componentInstance.pages).toBe(1);
    });

    it('запас корня уезжает наблюдателю', (): void => {
        expect(setup() && lastObserver().options.rootMargin).toBe('50%');
    });

    it('своя величина запаса перебивает умолчание', (): void => {
        const fixture: ComponentFixture<InfiniteScrollHostComponent> = setup();

        fixture.componentInstance.rootMargin.set('200px');
        fixture.detectChanges();

        expect(lastObserver().options.rootMargin).toBe('200px');
    });

    it('на паузе наблюдение снимается и страниц больше не просит', (): void => {
        const fixture: ComponentFixture<InfiniteScrollHostComponent> = setup();
        const first: ObserverDouble = lastObserver();

        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();

        expect(first.disconnected).toBe(true);
        expect(ObserverDouble.created.length).toBe(1);
    });

    it('после снятия паузы наблюдение заводится заново', (): void => {
        // Прежний наблюдатель повторного колбэка не пришлёт: пересечение с
        // прошлого раза не менялось, и список замер бы навсегда.
        const fixture: ComponentFixture<InfiniteScrollHostComponent> = setup();

        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();
        fixture.componentInstance.disabled.set(false);
        fixture.detectChanges();

        expect(ObserverDouble.created.length).toBe(2);
        expect(lastObserver().disconnected).toBe(false);
    });

    it('снятая обёртка снимает и наблюдение', (): void => {
        const fixture: ComponentFixture<InfiniteScrollHostComponent> = setup();
        const observer: ObserverDouble = lastObserver();

        fixture.destroy();

        expect(observer.disconnected).toBe(true);
    });

    it('среда без наблюдателя пересечений не роняет обёртку', (): void => {
        // Страница, отданная сервером, доезжает до потребителя и без него —
        // догрузка просто не заводится.
        const fixture: ComponentFixture<InfiniteScrollHostComponent> = createRtFixture(
            InfiniteScrollHostComponent,
            {},
            { providers: [{ provide: WINDOW, useFactory: (): Window & typeof globalThis => ({}) as Window & typeof globalThis }] }
        );

        expect(fixture.componentInstance.pages).toBe(0);
    });
});
