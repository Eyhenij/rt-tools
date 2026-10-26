import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, setInputs } from '../../../testing/rt-kit-testing';
import { RtDividerComponent } from './rt-divider.component';

function setup(inputs: Partial<{ vertical: boolean; inset: boolean }> = {}): HTMLElement {
    const fixture: ComponentFixture<RtDividerComponent> = createRtFixture(RtDividerComponent);

    setInputs(fixture, inputs);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
}

describe('RtDividerComponent', (): void => {
    it('SC-UKV-931 — по умолчанию горизонтальный разделитель без отступа', (): void => {
        const host: HTMLElement = setup();

        expect(host.getAttribute('role')).toBe('separator');
        expect(host.getAttribute('aria-orientation')).toBe('horizontal');
        expect(host.classList).toContain('rt-divider');
        expect(host.classList).not.toContain('rt-divider--vertical');
        expect(host.classList).not.toContain('rt-divider--inset');
    });

    it('SC-UKV-931 — vertical ставит линию вертикально и объявляет это', (): void => {
        const host: HTMLElement = setup({ vertical: true });

        expect(host.getAttribute('aria-orientation')).toBe('vertical');
        expect(host.classList).toContain('rt-divider--vertical');
    });

    it('SC-UKV-931 — inset даёт отступ', (): void => {
        expect(setup({ inset: true }).classList).toContain('rt-divider--inset');
    });
});
