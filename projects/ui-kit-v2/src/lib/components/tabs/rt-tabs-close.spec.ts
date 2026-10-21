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

    describe('SC-UKV-995 — у крестика своя подсказка, подсказка вкладки над ним молчит', (): void => {
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
});
