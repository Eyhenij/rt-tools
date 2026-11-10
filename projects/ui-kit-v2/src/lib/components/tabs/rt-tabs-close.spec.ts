import { ChangeDetectionStrategy, Component, DebugElement, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';

/** Закрываемая вкладка со своей подсказкой и подсказкой крестика, как в шапке страницы приложения. */
@Component({
    selector: 'rt-tabs-close-host',
    template: `
        <rt-tabs>
            <ng-template
                rtTab="accounts"
                label="Счета"
                tooltip="Счета гостей"
                closeTooltipPlacement="top"
                [closable]="closable()"
                [closeTooltip]="closeTooltip()">
                Счета
            </ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsCloseHostComponent {
    public readonly closable: WritableSignal<boolean> = signal<boolean>(true);
    public readonly closeTooltip: WritableSignal<string> = signal<string>('Закрыть');
}

@Component({
    selector: 'rt-tabs-close-on-host',
    template: `
        <rt-tabs activeId="a" closeOn="selected" (tabClose)="closed.set($event)">
            <ng-template rtTab="a" label="А" closable>А</ng-template>
            <ng-template rtTab="b" label="Б" closable>Б</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsCloseOnHostComponent {
    public readonly closed: WritableSignal<string | null> = signal<string | null>(null);
}

@Component({
    selector: 'rt-tabs-pinned-host',
    template: `
        <rt-tabs activeId="a">
            <ng-template rtTab="a" label="А" pinned closable>А</ng-template>
            <ng-template rtTab="b" label="Б">Б</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsPinnedHostComponent {}

function setup(): ComponentFixture<TabsCloseHostComponent> {
    return createRtFixture(TabsCloseHostComponent);
}

function tab(fixture: ComponentFixture<TabsCloseHostComponent>): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[data-tabid="accounts"]') as HTMLButtonElement;
}

function close(fixture: ComponentFixture<TabsCloseHostComponent>): HTMLElement {
    return (qa(fixture, 'tabs-tab-close') as DebugElement).nativeElement as HTMLElement;
}

function pointer(fixture: ComponentFixture<TabsCloseHostComponent>, node: HTMLElement, type: 'mouseenter' | 'mouseleave'): void {
    node.dispatchEvent(new Event(type));
    fixture.detectChanges();
    jest.advanceTimersByTime(300);
    fixture.detectChanges();
}

/** Тексты открытых подсказок: закрытая панель остаётся в слое пустой. */
function tooltips(): string[] {
    return Array.from(document.querySelectorAll('rt-tooltip'))
        .map((node: Element): string => node.textContent?.trim() ?? '')
        .filter((text: string): boolean => text !== '');
}

describe('RtTabsComponent — подсказка крестика закрываемой вкладки', (): void => {
    beforeEach((): void => {
        jest.useFakeTimers();
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
        jest.useRealTimers();
    });

    describe('SC-UKV-1201 — the close button only on the selected tab', (): void => {
        it('SC-UKV-1201 — an unselected closable tab draws no close button in the row', (): void => {
            const fixture: ComponentFixture<TabsCloseOnHostComponent> = createRtFixture(TabsCloseOnHostComponent);

            const closes: NodeListOf<Element> = (fixture.nativeElement as HTMLElement).querySelectorAll('[qa-dataid="tabs-tab-close"]');

            expect(closes).toHaveLength(1);
            expect(closes[0].closest('[data-tabitem]')?.getAttribute('data-tabitem')).toBe('a');
        });
    });

    describe('SC-UKV-1213 — Delete closes only a tab whose cross is shown', (): void => {
        function pressDelete(fixture: ComponentFixture<TabsCloseOnHostComponent>, id: string): void {
            (fixture.nativeElement as HTMLElement)
                .querySelector(`[data-tabid="${id}"]`)
                ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
            fixture.detectChanges();
        }

        it('SC-UKV-1213 — Delete on an unselected tab without a cross asks nothing', (): void => {
            const fixture: ComponentFixture<TabsCloseOnHostComponent> = createRtFixture(TabsCloseOnHostComponent);

            pressDelete(fixture, 'b');

            expect(fixture.componentInstance.closed()).toBeNull();
            expect((fixture.nativeElement as HTMLElement).querySelector('[data-tabid="b"]')?.hasAttribute('aria-keyshortcuts')).toBe(false);
        });

        it('SC-UKV-1213 — Delete on the selected tab with its cross asks to close it', (): void => {
            const fixture: ComponentFixture<TabsCloseOnHostComponent> = createRtFixture(TabsCloseOnHostComponent);

            pressDelete(fixture, 'a');

            expect(fixture.componentInstance.closed()).toBe('a');
        });
    });

    describe('SC-UKV-1205 — a pinned tab draws the pin itself and may be closed', (): void => {
        it('SC-UKV-1205 — the pinned tab has the pin icon and its close button, the other tab has neither', (): void => {
            const fixture: ComponentFixture<TabsPinnedHostComponent> = createRtFixture(TabsPinnedHostComponent);
            const root: HTMLElement = fixture.nativeElement as HTMLElement;
            const pinned: Element = root.querySelector('[data-tabitem="a"]') as Element;
            const other: Element = root.querySelector('[data-tabitem="b"]') as Element;

            expect(pinned.querySelector('rt-icon')).not.toBeNull();
            expect(pinned.querySelector('[qa-dataid="tabs-tab-close"]')).not.toBeNull();
            expect(other.querySelector('rt-icon')).toBeNull();
        });
    });

    describe('SC-UKV-995 — у крестика своя подсказка,подсказка вкладки над ним молчит', (): void => {
        it('SC-UKV-995 — наведение на крестик показывает его подсказку', (): void => {
            const fixture: ComponentFixture<TabsCloseHostComponent> = setup();

            pointer(fixture, close(fixture), 'mouseenter');

            expect(tooltips()).toEqual(['Закрыть']);
        });

        it('SC-UKV-995 — указатель с вкладки на крестик: подсказка вкладки уходит, остаётся только крестика', (): void => {
            const fixture: ComponentFixture<TabsCloseHostComponent> = setup();

            pointer(fixture, tab(fixture), 'mouseenter');
            expect(tooltips()).toEqual(['Счета гостей']);

            pointer(fixture, close(fixture), 'mouseenter');

            expect(tooltips()).toEqual(['Закрыть']);
        });

        it('SC-UKV-995 — без подсказки крестика над ним нет ни одной подсказки', (): void => {
            const fixture: ComponentFixture<TabsCloseHostComponent> = setup();
            fixture.componentInstance.closeTooltip.set('');
            fixture.detectChanges();

            pointer(fixture, tab(fixture), 'mouseenter');
            pointer(fixture, close(fixture), 'mouseenter');

            expect(tooltips()).toEqual([]);
        });

        it('SC-UKV-995 — уход с крестика возвращает подсказку вкладке при следующем наведении', (): void => {
            const fixture: ComponentFixture<TabsCloseHostComponent> = setup();

            pointer(fixture, close(fixture), 'mouseenter');
            pointer(fixture, close(fixture), 'mouseleave');
            pointer(fixture, tab(fixture), 'mouseleave');
            pointer(fixture, tab(fixture), 'mouseenter');

            expect(tooltips()).toEqual(['Счета гостей']);
        });

        it('SC-UKV-995 — крестик, убранный из-под указателя, не держит подсказку вкладки молчащей', (): void => {
            const fixture: ComponentFixture<TabsCloseHostComponent> = setup();

            pointer(fixture, close(fixture), 'mouseenter');
            fixture.componentInstance.closable.set(false);
            fixture.detectChanges();
            pointer(fixture, tab(fixture), 'mouseleave');
            pointer(fixture, tab(fixture), 'mouseenter');

            expect(tooltips()).toEqual(['Счета гостей']);
        });
    });

    describe('SC-UKV-1019 — крестик вкладки доступен с клавиатуры', (): void => {
        it('SC-UKV-1019 — имя крестика для чтения с экрана — текст его подсказки', (): void => {
            const fixture: ComponentFixture<TabsCloseHostComponent> = setup();

            expect(close(fixture).getAttribute('aria-label')).toBe('Закрыть');

            fixture.componentInstance.closeTooltip.set('Убрать вкладку');
            fixture.detectChanges();

            expect(close(fixture).getAttribute('aria-label')).toBe('Убрать вкладку');
        });
    });
});
