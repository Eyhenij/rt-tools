import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtTooltipDirective } from './rt-tooltip.directive';

/** Подсказка живёт в оверлее CDK — ищем её в документе. */
function tip(): HTMLElement | null {
    return document.querySelector('rt-tooltip');
}

@Component({
    selector: 'rt-tooltip-truncated-host',
    template: `
        <span
            qa-dataid="tooltip-cell"
            rtTooltip="Договор поставки № 2026-114 с дополнительным соглашением"
            [rtTooltipWhenTruncated]="mode()">
            Договор поставки № 2026-114 с дополнительным соглашением
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTooltipDirective],
})
class TruncatedHostComponent {
    public readonly mode: WritableSignal<boolean> = signal<boolean>(true);
}

type THostFixture = ComponentFixture<TruncatedHostComponent>;

/**
 * В jsdom нет раскладки, и обе ширины у любого узла нулевые. Тест задаёт их сам — так же, как
 * браузер отдал бы их узлу, чей текст шире коробки или помещается в неё.
 */
function sizeCell(fixture: THostFixture, clientWidth: number, scrollWidth: number): void {
    const cell: HTMLElement = qa(fixture, 'tooltip-cell')?.nativeElement as HTMLElement;

    Object.defineProperty(cell, 'clientWidth', { configurable: true, value: clientWidth });
    Object.defineProperty(cell, 'scrollWidth', { configurable: true, value: scrollWidth });
}

function setup(mode: boolean): THostFixture {
    const fixture: THostFixture = createRtFixture(TruncatedHostComponent, {}, { skipInitialDetect: true });

    fixture.componentInstance.mode.set(mode);
    fixture.detectChanges();

    return fixture;
}

function hoverAndWait(fixture: THostFixture): void {
    (qa(fixture, 'tooltip-cell')?.nativeElement as HTMLElement).dispatchEvent(new Event('mouseenter'));
    jest.advanceTimersByTime(300);
    fixture.detectChanges();
}

describe('RtTooltipDirective — подсказка у обрезанного текста', (): void => {
    beforeEach((): void => {
        jest.useFakeTimers();
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((container: Element): void => container.remove());
        jest.useRealTimers();
    });

    it('SC-UKV-458 — в режиме у обрезанного текста подсказка появляется', (): void => {
        const fixture: THostFixture = setup(true);

        sizeCell(fixture, 120, 310);
        hoverAndWait(fixture);

        expect(tip()?.textContent).toBe('Договор поставки № 2026-114 с дополнительным соглашением');
    });

    it('SC-UKV-459 — в режиме у целого текста подсказки нет', (): void => {
        const fixture: THostFixture = setup(true);

        sizeCell(fixture, 400, 310);
        hoverAndWait(fixture);

        expect(qa(fixture, 'tooltip-cell')).not.toBeNull();
        expect(tip()).toBeNull();
    });

    it('SC-UKV-460 — текст, переставший помещаться после отрисовки, судится в момент показа', (): void => {
        const fixture: THostFixture = setup(true);

        sizeCell(fixture, 400, 310);
        hoverAndWait(fixture);

        expect(tip()).toBeNull();

        (qa(fixture, 'tooltip-cell')?.nativeElement as HTMLElement).dispatchEvent(new Event('mouseleave'));
        sizeCell(fixture, 120, 310);
        hoverAndWait(fixture);

        expect(tip()).not.toBeNull();
    });

    it('SC-UKV-461 — без режима у целого текста подсказка остаётся', (): void => {
        const fixture: THostFixture = setup(false);

        sizeCell(fixture, 400, 310);
        hoverAndWait(fixture);

        expect(tip()).not.toBeNull();
    });
});
