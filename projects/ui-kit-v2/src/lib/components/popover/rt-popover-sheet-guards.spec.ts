import { ApplicationRef, ChangeDetectionStrategy, Component, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtPopoverDirective } from './rt-popover.directive';
import { RT_POPOVER_SHEET } from './rt-popover-sheet.token';
import { rtPreloadPopoverSheet } from './rt-popover-sheet.helper';

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = this.viewportNarrow;
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

@Component({
    selector: 'rt-popover-sheet-guards-host',
    template: `
        <button type="button" qa-dataid="guards-trigger" rtPopoverSheet rtPopoverSheetTitle="Выбор" [rtPopover]="tpl">Открыть</button>
        <ng-template #tpl><button type="button" qa-dataid="guards-inner">Внутри</button></ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPopoverDirective],
})
class SheetGuardsHostComponent {}

function setup(providers: Provider[] = []): ComponentFixture<SheetGuardsHostComponent> {
    const stub: BreakpointsStub = new BreakpointsStub();
    return createRtFixture(SheetGuardsHostComponent, {}, { providers: [{ provide: BreakpointsService, useValue: stub }, ...providers] });
}

function settle(fixture: ComponentFixture<SheetGuardsHostComponent>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function trigger(fixture: ComponentFixture<SheetGuardsHostComponent>): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="guards-trigger"]') as HTMLButtonElement;
}

describe('Нижняя шторка поповера — токен, фокус и уход вниз', (): void => {
    beforeAll(async (): Promise<void> => {
        await rtPreloadPopoverSheet();
    });

    afterEach((): void => {
        jest.restoreAllMocks();
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1703: токен RT_POPOVER_SHEET со значением false оставляет панель у триггера на телефоне', (): void => {
        const fixture: ComponentFixture<SheetGuardsHostComponent> = setup([{ provide: RT_POPOVER_SHEET, useValue: false }]);

        trigger(fixture).click();
        settle(fixture);

        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
        expect(document.querySelector('[qa-dataid="guards-inner"]')).not.toBeNull();
    });

    it('SC-UKV-1703: без токена на телефоне панель открывается в шторке', (): void => {
        const fixture: ComponentFixture<SheetGuardsHostComponent> = setup();

        trigger(fixture).click();
        settle(fixture);

        expect(document.querySelector('.rt-popover-sheet [qa-dataid="guards-inner"]')).not.toBeNull();
    });

    it('SC-UKV-1588: закрытие шторки возвращает фокус триггеру, если он был внутри шторки', (): void => {
        const fixture: ComponentFixture<SheetGuardsHostComponent> = setup();
        trigger(fixture).click();
        settle(fixture);
        (document.querySelector('[qa-dataid="guards-inner"]') as HTMLElement).focus();

        (document.querySelector('[qa-dataid="bottom-sheet-backdrop"]') as HTMLElement).click();
        settle(fixture);

        expect(document.activeElement).toBe(trigger(fixture));
    });

    it('SC-UKV-1588: закрытие шторки не крадёт фокус, если он был в другом месте', (): void => {
        const fixture: ComponentFixture<SheetGuardsHostComponent> = setup();
        trigger(fixture).click();
        settle(fixture);
        const other: HTMLButtonElement = document.createElement('button');
        document.body.appendChild(other);
        other.focus();

        (document.querySelector('[qa-dataid="bottom-sheet-backdrop"]') as HTMLElement).click();
        settle(fixture);

        expect(document.activeElement).toBe(other);
        other.remove();
    });

    it('SC-UKV-1591: шторка уезжает вниз и снимается по окончании перехода', (): void => {
        const real: typeof getComputedStyle = window.getComputedStyle.bind(window);
        jest.spyOn(window, 'getComputedStyle').mockImplementation((element: Element): CSSStyleDeclaration => {
            const style: CSSStyleDeclaration = real(element);
            return element.getAttribute('qa-dataid') === 'bottom-sheet-panel' ? { ...style, transitionDuration: '0.2s' } : style;
        });
        const fixture: ComponentFixture<SheetGuardsHostComponent> = setup();
        trigger(fixture).click();
        settle(fixture);
        expect(document.querySelector('.rt-bottom-sheet--open')).not.toBeNull();

        (document.querySelector('[qa-dataid="bottom-sheet-backdrop"]') as HTMLElement).click();
        settle(fixture);

        expect(document.querySelector('.rt-popover-sheet')).not.toBeNull();
        expect(document.querySelector('.rt-bottom-sheet--open')).toBeNull();

        const panel: Element | null = document.querySelector('[qa-dataid="bottom-sheet-panel"]');
        const bubbled: Event = new Event('transitionend', { bubbles: true });
        Object.defineProperty(bubbled, 'propertyName', { value: 'background-color' });
        document.querySelector('[qa-dataid="bottom-sheet-handle"]')?.dispatchEvent(bubbled);
        expect(document.querySelector('.rt-popover-sheet')).not.toBeNull();

        const slid: Event = new Event('transitionend');
        Object.defineProperty(slid, 'propertyName', { value: 'transform' });
        panel?.dispatchEvent(slid);

        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
    });

    it('SC-UKV-1591: без события перехода шторку снимает страховочный таймер по длительности перехода', (): void => {
        jest.useFakeTimers();
        const real: typeof getComputedStyle = window.getComputedStyle.bind(window);
        jest.spyOn(window, 'getComputedStyle').mockImplementation((element: Element): CSSStyleDeclaration => {
            const style: CSSStyleDeclaration = real(element);
            return element.getAttribute('qa-dataid') === 'bottom-sheet-panel' ? { ...style, transitionDuration: '200ms' } : style;
        });
        const fixture: ComponentFixture<SheetGuardsHostComponent> = setup();
        trigger(fixture).click();
        settle(fixture);

        (document.querySelector('[qa-dataid="bottom-sheet-backdrop"]') as HTMLElement).click();
        settle(fixture);
        expect(document.querySelector('.rt-popover-sheet')).not.toBeNull();

        jest.advanceTimersByTime(300);
        jest.useRealTimers();

        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
    });
});
