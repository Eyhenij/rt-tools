import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtTooltipDirective } from './rt-tooltip.directive';

/** Подсказка живёт в оверлее CDK — ищем её в документе. */
function tip(): HTMLElement | null {
    return document.querySelector('rt-tooltip');
}

@Component({
    selector: 'rt-tooltip-tap-host',
    template: `
        <span role="img" qa-dataid="tooltip-host" rtTooltip="81% лимита" [rtTooltipShowOnTap]="showOnTap()">○</span>
        <span qa-dataid="tooltip-outside">Рядом</span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTooltipDirective],
})
class TapHostComponent {
    public readonly showOnTap: WritableSignal<boolean> = signal<boolean>(true);
}

type THostFixture = ComponentFixture<TapHostComponent>;

function setup(showOnTap: boolean): THostFixture {
    const fixture: THostFixture = createRtFixture(TapHostComponent, {}, { skipInitialDetect: true });
    fixture.componentInstance.showOnTap.set(showOnTap);
    fixture.detectChanges();
    return fixture;
}

/** Касание: браузер шлёт вход указателя и сразу клик */
function tap(fixture: THostFixture): void {
    const host: HTMLElement = qa(fixture, 'tooltip-host')?.nativeElement as HTMLElement;
    host.dispatchEvent(new Event('mouseenter'));
    host.click();
    fixture.detectChanges();
}

describe('RtTooltipDirective — подсказка, открываемая касанием', (): void => {
    beforeEach((): void => {
        jest.useFakeTimers();
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((container: Element): void => container.remove());
        jest.useRealTimers();
    });

    it('SC-UKV-1051 — с rtTooltipShowOnTap касание открывает подсказку сразу, без задержки', (): void => {
        const fixture: THostFixture = setup(true);

        tap(fixture);

        expect(tip()?.textContent?.trim()).toBe('81% лимита');
    });

    it('SC-UKV-1052 — повторное касание закрывает подсказку, и позже она сама не всплывает', (): void => {
        const fixture: THostFixture = setup(true);
        tap(fixture);
        expect(tip()).not.toBeNull();

        tap(fixture);
        jest.advanceTimersByTime(500);
        fixture.detectChanges();

        expect(tip()).toBeNull();
    });

    it('SC-UKV-1053 — касание вне хоста закрывает подсказку', (): void => {
        const fixture: THostFixture = setup(true);
        tap(fixture);
        expect(tip()).not.toBeNull();

        const outside: HTMLElement = qa(fixture, 'tooltip-outside')?.nativeElement as HTMLElement;
        outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        outside.click();
        fixture.detectChanges();

        expect(tip()).toBeNull();
    });

    it('SC-UKV-1054 — без входа касание по-прежнему подсказку не показывает', (): void => {
        const fixture: THostFixture = setup(false);

        tap(fixture);
        jest.advanceTimersByTime(500);
        fixture.detectChanges();

        expect(tip()).toBeNull();
    });
});
