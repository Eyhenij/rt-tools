import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, qa } from '../../../testing/rt-kit-testing';
import { RtContainerComponent, TRtContainerRightMode } from './rt-container.component';
import { RtContainerContentDirective, RtContainerRightSidenavDirective } from './rt-container.directives';

/** Каркас с правой панелью: место, подложка, ширина и ручка — сигналы владельца. */
@Component({
    selector: 'rt-container-right-panel-host',
    template: `
        <rt-container
            [rightMode]="mode()"
            [rightBackdrop]="backdrop()"
            [rightResizable]="resizable()"
            [(rightWidth)]="width"
            (rightOpened)="events.push('opened')"
            (rightClosed)="events.push('closed')">
            <ng-template rtContainerContent><span qa-dataid="slot-content">Содержимое</span></ng-template>
            <ng-template rtContainerRightSidenav><input qa-dataid="slot-right-field" /></ng-template>
        </rt-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtContainerComponent, RtContainerContentDirective, RtContainerRightSidenavDirective],
})
class RightPanelHostComponent {
    public readonly mode: WritableSignal<TRtContainerRightMode> = signal<TRtContainerRightMode>('side');
    public readonly backdrop: WritableSignal<boolean> = signal(true);
    public readonly resizable: WritableSignal<boolean> = signal(false);
    public readonly width: WritableSignal<number | null> = signal<number | null>(360);
    public readonly events: string[] = [];
}

function setup(apply: (host: RightPanelHostComponent) => void = (): void => undefined): ComponentFixture<RightPanelHostComponent> {
    const fixture: ComponentFixture<RightPanelHostComponent> = createRtFixture(RightPanelHostComponent);

    apply(fixture.componentInstance);
    fixture.detectChanges();
    fixture.detectChanges();
    return fixture;
}

function containerOf(fixture: ComponentFixture<RightPanelHostComponent>): RtContainerComponent {
    return el(fixture, 'rt-container')?.componentInstance as RtContainerComponent;
}

function cell(fixture: ComponentFixture<RightPanelHostComponent>): HTMLElement | null {
    return (qa(fixture, 'container-right-sidenav')?.nativeElement as HTMLElement | undefined) ?? null;
}

function overlayPane(): HTMLElement | null {
    return document.querySelector('.rt-aside-overlay');
}

describe('RtContainerComponent — правая панель', (): void => {
    beforeEach((): void => {
        jest.useFakeTimers();
    });

    afterEach((): void => {
        jest.useRealTimers();
    });

    describe('рядом с содержимым', (): void => {
        it('SC-UKV-895 — панель стоит колонкой в сетке, оверлея нет, панель готова к открытию', (): void => {
            const fixture: ComponentFixture<RightPanelHostComponent> = setup();
            const host: HTMLElement = el(fixture, 'rt-container')?.nativeElement as HTMLElement;

            expect(cell(fixture)?.tagName).toBe('ASIDE');
            expect(host.classList).toContain('rt-container--right-side');
            expect(cell(fixture)?.querySelector('[qa-dataid="slot-right-field"]')).not.toBeNull();
            expect(cell(fixture)?.style.getPropertyValue('--rt-container-right-width')).toBe('360px');
            expect(overlayPane()).toBeNull();
            expect(containerOf(fixture).rightOverlayReady()).toBe(true);
        });

        it('SC-UKV-895 — открытие и закрытие ставят колонку и сообщают о себе', (): void => {
            const fixture: ComponentFixture<RightPanelHostComponent> = setup();

            expect(cell(fixture)?.hasAttribute('inert')).toBe(true);

            containerOf(fixture).openRight();
            fixture.detectChanges();
            jest.runOnlyPendingTimers();

            expect(cell(fixture)?.classList).toContain('rt-container__right-sidenav--open');
            expect(cell(fixture)?.hasAttribute('inert')).toBe(false);

            containerOf(fixture).closeRight();
            fixture.detectChanges();

            expect(cell(fixture)?.classList).not.toContain('rt-container__right-sidenav--open');
            expect(fixture.componentInstance.events).toEqual(['opened', 'closed']);
        });

        it('SC-UKV-895 — открытая панель при смене места на «поверх» остаётся открытой', (): void => {
            const fixture: ComponentFixture<RightPanelHostComponent> = setup();
            containerOf(fixture).openRight();
            fixture.detectChanges();

            fixture.componentInstance.mode.set('over');
            fixture.detectChanges();
            fixture.detectChanges();

            expect(cell(fixture)).toBeNull();
            expect(overlayPane()?.classList).toContain('rt-aside-overlay--open');
            expect(overlayPane()?.querySelector('[qa-dataid="slot-right-field"]')).not.toBeNull();
            expect(containerOf(fixture).rightOpen()).toBe(true);
        });
    });

    describe('поверх страницы', (): void => {
        it('SC-UKV-896 — без подложки оверлей создаётся без неё', (): void => {
            const fixture: ComponentFixture<RightPanelHostComponent> = setup((it: RightPanelHostComponent): void => {
                it.mode.set('over');
                it.backdrop.set(false);
            });

            containerOf(fixture).openRight();
            fixture.detectChanges();

            expect(overlayPane()).not.toBeNull();
            expect(document.querySelector('.rt-aside-backdrop')).toBeNull();
        });

        it('по умолчанию подложка есть, как прежде', (): void => {
            setup((it: RightPanelHostComponent): void => it.mode.set('over'));

            expect(document.querySelector('.rt-aside-backdrop')).not.toBeNull();
        });
    });

    describe('ширина', (): void => {
        it('SC-UKV-897 — ручка у левого края пишет ширину владельцу в пределах', (): void => {
            const fixture: ComponentFixture<RightPanelHostComponent> = setup((it: RightPanelHostComponent): void => it.resizable.set(true));
            const handle: HTMLElement = qa(fixture, 'resize-handle')?.nativeElement as HTMLElement;

            expect(handle.classList).toContain('rt-resize-handle--edge--start');

            handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
            fixture.detectChanges();
            expect(fixture.componentInstance.width()).toBe(376);

            handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
            fixture.detectChanges();
            expect(fixture.componentInstance.width()).toBe(960);
            expect(cell(fixture)?.style.getPropertyValue('--rt-container-right-width')).toBe('960px');
        });

        it('без ширины панель шириной по содержимому, без ручки — как прежде', (): void => {
            const fixture: ComponentFixture<RightPanelHostComponent> = setup((it: RightPanelHostComponent): void => it.width.set(null));

            expect(cell(fixture)?.style.getPropertyValue('--rt-container-right-width')).toBe('');
            expect(qa(fixture, 'resize-handle')).toBeNull();
        });
    });
});
