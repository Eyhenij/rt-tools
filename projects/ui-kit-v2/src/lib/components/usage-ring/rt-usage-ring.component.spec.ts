import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa } from '../../../testing/rt-kit-testing';
import { rtUsagePercent, RtUsageRingComponent, RT_USAGE_RING_CIRCUMFERENCE } from './rt-usage-ring.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtUsageRingComponent> {
    return createRtFixture(RtUsageRingComponent, { value: 32, ...inputs });
}

function ring(fixture: ComponentFixture<RtUsageRingComponent>): HTMLElement {
    return qa(fixture, 'usage-ring')?.nativeElement;
}

describe('RtUsageRingComponent', (): void => {
    it('несёт свой BEM-блок на host-е', (): void => {
        expect(hostClasses(setup())).toContain('rt-usage-ring');
    });

    it('SC-UKV-1079 — дуга закрашивает долю лимита, а скринридер слышит процент', (): void => {
        const fixture: ComponentFixture<RtUsageRingComponent> = setup();
        const arc: SVGCircleElement | null = ring(fixture).querySelector('.rt-usage-ring__arc');

        expect(ring(fixture).getAttribute('aria-label')).toBe('Used 32% of the limit');
        expect(Number(arc?.getAttribute('stroke-dashoffset'))).toBeCloseTo(RT_USAGE_RING_CIRCUMFERENCE * 0.68, 5);
    });

    it('SC-UKV-1079 — доля прижимается к границам и округляется', (): void => {
        expect(rtUsagePercent(-5)).toBe(0);
        expect(rtUsagePercent(140)).toBe(100);
        expect(rtUsagePercent(31.6)).toBe(32);
        expect(rtUsagePercent(Number.NaN)).toBe(0);
    });

    it('SC-UKV-1079 — с порога предупреждения кольцо оранжевое, ниже — нет', (): void => {
        expect(ring(setup({ value: 79 })).classList).not.toContain('rt-usage-ring__ring--warning');
        expect(ring(setup({ value: 81 })).classList).toContain('rt-usage-ring__ring--warning');
        expect(ring(setup({ value: 50, warnAt: 50 })).classList).toContain('rt-usage-ring__ring--warning');
    });

    it('SC-UKV-1079 — с подсказкой кольцо берёт фокус, без неё в порядок обхода не входит', (): void => {
        expect(ring(setup({ hint: '32% of the monthly limit' })).getAttribute('tabindex')).toBe('0');
        expect(ring(setup()).hasAttribute('tabindex')).toBe(false);
    });

    it('SC-UKV-1055 — касание кольца открывает подсказку сразу: на телефоне наведения нет', (): void => {
        const fixture: ComponentFixture<RtUsageRingComponent> = setup({ value: 81, hint: '81% of the monthly limit' });

        ring(fixture).dispatchEvent(new Event('mouseenter'));
        ring(fixture).click();
        fixture.detectChanges();

        expect(document.querySelector('rt-tooltip')?.textContent?.trim()).toBe('81% of the monthly limit');
    });
});
