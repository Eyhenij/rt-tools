import { ApplicationRef, ChangeDetectionStrategy, Component, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtPopoverDirective } from './rt-popover.directive';
import { rtPopoverSheetFocusTarget, rtPreloadPopoverSheet } from './rt-popover-sheet.helper';

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = this.viewportNarrow;
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

/** Триггер — обёртка без `tabindex`, как у разделённой кнопки и подсказчика: фокус в ней только у узла внутри. */
@Component({
    selector: 'rt-popover-sheet-review-host',
    template: `
        <div
            qa-dataid="review-host"
            rtPopoverSheet
            rtPopoverSheetTitle="Выбор"
            rtPopoverPanelClass="review-hook other-hook"
            [rtPopover]="tpl"
            (rtPopoverSheetOpened)="sheetOpened = sheetOpened + 1">
            <button type="button" qa-dataid="review-inner-button">Открыть</button>
        </div>
        <ng-template #tpl><button type="button" qa-dataid="review-panel-button">Внутри</button></ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPopoverDirective],
})
class ReviewHostComponent {
    public sheetOpened: number = 0;
}

function setup(): ComponentFixture<ReviewHostComponent> {
    const providers: Provider[] = [{ provide: BreakpointsService, useValue: new BreakpointsStub() }];
    return createRtFixture(ReviewHostComponent, {}, { providers });
}

function settle(fixture: ComponentFixture<unknown>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function host(fixture: ComponentFixture<unknown>): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="review-host"]') as HTMLElement;
}

function backdrop(): HTMLElement {
    return document.querySelector('[qa-dataid="bottom-sheet-backdrop"]') as HTMLElement;
}

/** Длительность выезда панели шторки: у остального вызова — настоящая. */
function mockDuration(duration: (panel: Element) => string): void {
    const real: typeof getComputedStyle = window.getComputedStyle.bind(window);
    jest.spyOn(window, 'getComputedStyle').mockImplementation((element: Element): CSSStyleDeclaration => {
        const style: CSSStyleDeclaration = real(element);
        return element.getAttribute('qa-dataid') === 'bottom-sheet-panel' ? { ...style, transitionDuration: duration(element) } : style;
    });
}

describe('Нижняя шторка поповера — замечания ревью', (): void => {
    beforeAll(async (): Promise<void> => {
        await rtPreloadPopoverSheet();
    });

    afterEach((): void => {
        jest.restoreAllMocks();
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1619 — открытие шторки, пока прежняя ещё уезжает, снимает прежнюю сразу', (): void => {
        mockDuration((): string => '0.2s');
        const fixture: ComponentFixture<ReviewHostComponent> = setup();
        host(fixture).click();
        settle(fixture);
        backdrop().click();
        settle(fixture);
        // Прежняя шторка закрыта и уезжает: её оверлей ещё в документе.
        expect(document.querySelectorAll('.rt-popover-sheet').length).toBe(1);
        expect(document.querySelector('.rt-bottom-sheet--open')).toBeNull();

        host(fixture).click();
        settle(fixture);

        // В документе одна шторка — новая и открытая: уезжавшая снята, не дожидаясь своего перехода.
        expect(document.querySelectorAll('.rt-popover-sheet').length).toBe(1);
        expect(document.querySelectorAll('.rt-bottom-sheet--open').length).toBe(1);
    });

    it('SC-UKV-1620 — фокус из закрытой шторки возвращается на первый фокусируемый узел в host без tabindex', (): void => {
        const fixture: ComponentFixture<ReviewHostComponent> = setup();
        host(fixture).click();
        settle(fixture);
        (document.querySelector('[qa-dataid="review-panel-button"]') as HTMLElement).focus();

        backdrop().click();
        settle(fixture);

        expect(document.activeElement).toBe((fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="review-inner-button"]'));
    });

    it('SC-UKV-1620 — цель возврата фокуса: фокусируемый host — он сам, иначе первый фокусируемый узел, иначе host', (): void => {
        const focusable: HTMLElement = document.createElement('button');
        const wrapper: HTMLElement = document.createElement('div');
        const inner: HTMLElement = document.createElement('input');
        wrapper.append(inner);
        const empty: HTMLElement = document.createElement('div');

        expect(rtPopoverSheetFocusTarget(focusable)).toBe(focusable);
        expect(rtPopoverSheetFocusTarget(wrapper)).toBe(inner);
        expect(rtPopoverSheetFocusTarget(empty)).toBe(empty);
    });

    it('SC-UKV-1622 — шторка, закрытая сдвигом вниз, выезжает: длительность читается после снятия класса жеста', (): void => {
        // Пока на панели класс жеста, переход выключен и длительность нулевая — как в браузере.
        mockDuration((panel: Element): string => (panel.classList.contains('rt-bottom-sheet__panel--dragging') ? '0s' : '0.2s'));
        const fixture: ComponentFixture<ReviewHostComponent> = setup();
        host(fixture).click();
        settle(fixture);
        const handle: HTMLElement = document.querySelector('[qa-dataid="bottom-sheet-handle"]') as HTMLElement;
        const pointer: (type: string, clientY: number) => MouseEvent = (type: string, clientY: number): MouseEvent =>
            new MouseEvent(type, { bubbles: true, clientY });

        handle.dispatchEvent(pointer('pointerdown', 0));
        settle(fixture);
        document.dispatchEvent(pointer('pointermove', 200));
        settle(fixture);
        expect(document.querySelector('.rt-bottom-sheet__panel--dragging')).not.toBeNull();
        document.dispatchEvent(pointer('pointerup', 0));
        settle(fixture);

        // Выезд идёт: шторка ещё в документе и снимется по окончанию перехода.
        expect(document.querySelector('.rt-popover-sheet')).not.toBeNull();
        const slid: Event = new Event('transitionend');
        Object.defineProperty(slid, 'propertyName', { value: 'transform' });
        document.querySelector('[qa-dataid="bottom-sheet-panel"]')?.dispatchEvent(slid);
        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
    });

    it('SC-UKV-1623 — у диалога шторки есть имя: aria-labelledby ведёт на заголовок', (): void => {
        const fixture: ComponentFixture<ReviewHostComponent> = setup();
        host(fixture).click();
        settle(fixture);

        const dialog: HTMLElement = document.querySelector('[qa-dataid="bottom-sheet-panel"]') as HTMLElement;
        const labelledBy: string | null = dialog.getAttribute('aria-labelledby');
        expect(labelledBy).not.toBeNull();
        expect(document.getElementById(labelledBy as string)?.textContent?.trim()).toBe('Выбор');
    });

    it('SC-UKV-1627 — классы rtPopoverPanelClass ставятся на коробку оверлея шторки', (): void => {
        const fixture: ComponentFixture<ReviewHostComponent> = setup();
        host(fixture).click();
        settle(fixture);

        const pane: HTMLElement | null = document.querySelector('.rt-popover-sheet')?.closest<HTMLElement>('.cdk-overlay-pane') ?? null;
        expect(pane?.classList).toContain('review-hook');
        expect(pane?.classList).toContain('other-hook');
    });

    it('SC-UKV-1615 — событие «шторка открыта» приходит, когда шторка уже не inert', (): void => {
        const fixture: ComponentFixture<ReviewHostComponent> = setup();
        let inertWhenOpened: boolean | null = null;
        const focus: jest.SpyInstance = jest.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement): void {
            inertWhenOpened = this.closest('rt-bottom-sheet')?.hasAttribute('inert') ?? null;
        });
        const original: ReviewHostComponent = fixture.componentInstance;
        expect(original.sheetOpened).toBe(0);

        host(fixture).click();
        settle(fixture);
        // Обработчик события берёт фокус в панели — в этот миг `inert` уже снят.
        (document.querySelector('[qa-dataid="review-panel-button"]') as HTMLElement).focus();

        expect(original.sheetOpened).toBe(1);
        expect(inertWhenOpened).toBe(false);
        expect(document.querySelector('rt-bottom-sheet')?.hasAttribute('inert')).toBe(false);
        focus.mockRestore();
    });
});
