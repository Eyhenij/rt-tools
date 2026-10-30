import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, setInputs } from '../../../testing/rt-kit-testing';
import { clampProgress, RtProgressBarComponent } from './rt-progress-bar.component';

function setup(inputs: Record<string, unknown> = {}): ComponentFixture<RtProgressBarComponent> {
    const fixture: ComponentFixture<RtProgressBarComponent> = createRtFixture(RtProgressBarComponent);

    setInputs(fixture, inputs);
    fixture.detectChanges();

    return fixture;
}

function hostOf(fixture: ComponentFixture<RtProgressBarComponent>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
}

function fillOf(fixture: ComponentFixture<RtProgressBarComponent>): HTMLElement {
    return qa(fixture, 'progress-bar-fill')?.nativeElement as HTMLElement;
}

describe('RtProgressBarComponent', (): void => {
    it.each<[number, number]>([
        [-5, 0],
        [0, 0],
        [42.4, 42.4],
        [100, 100],
        [140, 100],
        [Number.NaN, 0],
    ])('SC-UKV-932 — доля %s прижимается к %s', (value: number, expected: number): void => {
        expect(clampProgress(value)).toBe(expected);
    });

    it('SC-UKV-932 — доля задаёт ширину заполнения и объявляется для чтения с экрана', (): void => {
        const fixture: ComponentFixture<RtProgressBarComponent> = setup({ value: 42, ariaLabel: 'Обновление набора данных' });

        expect(hostOf(fixture).getAttribute('role')).toBe('progressbar');
        expect(hostOf(fixture).getAttribute('aria-valuenow')).toBe('42');
        expect(hostOf(fixture).getAttribute('aria-valuemin')).toBe('0');
        expect(hostOf(fixture).getAttribute('aria-valuemax')).toBe('100');
        expect(hostOf(fixture).getAttribute('aria-label')).toBe('Обновление набора данных');
        expect(fillOf(fixture).style.width).toBe('42%');
    });

    it('SC-UKV-932 — доля из потока идёт следом и не выходит за 100', (): void => {
        const fixture: ComponentFixture<RtProgressBarComponent> = setup({ value: 10 });

        setInputs(fixture, { value: 75 });
        fixture.detectChanges();
        expect(fillOf(fixture).style.width).toBe('75%');

        setInputs(fixture, { value: 130 });
        fixture.detectChanges();
        expect(fillOf(fixture).style.width).toBe('100%');
        expect(hostOf(fixture).getAttribute('aria-valuenow')).toBe('100');
    });

    it('SC-UKV-932 — без доли бежит отрезок, и число не объявляется', (): void => {
        const fixture: ComponentFixture<RtProgressBarComponent> = setup({ mode: 'indeterminate', value: 30 });

        expect(hostOf(fixture).classList).toContain('rt-progress-bar--indeterminate');
        expect(hostOf(fixture).hasAttribute('aria-valuenow')).toBe(false);
        expect(fillOf(fixture).style.width).toBe('');
    });

    it('SC-UKV-932 — цвет доезжает до хоста, класс блока остаётся', (): void => {
        const fixture: ComponentFixture<RtProgressBarComponent> = setup({ color: 'success' });

        expect(hostOf(fixture).classList).toContain('rt-progress-bar');
        expect(hostOf(fixture).classList).toContain('rt-progress-bar--color--success');
    });
});
