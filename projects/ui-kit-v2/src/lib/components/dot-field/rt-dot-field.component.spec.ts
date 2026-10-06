import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses } from '../../../testing/rt-kit-testing';
import { RtDotFieldComponent } from './rt-dot-field.component';

describe('RtDotFieldComponent', (): void => {
    it('SC-UKV-637 — рисует один холст, скрытый от вспомогательных средств', (): void => {
        const fixture: ComponentFixture<RtDotFieldComponent> = createRtFixture(RtDotFieldComponent, {});
        const host: HTMLElement = fixture.nativeElement as HTMLElement;
        const canvases: NodeListOf<HTMLCanvasElement> = host.querySelectorAll('canvas');

        expect(hostClasses(fixture)).toContain('rt-dot-field');
        expect(canvases).toHaveLength(1);
        expect(canvases[0].getAttribute('aria-hidden')).toBe('true');
        expect(canvases[0].classList.contains('rt-dot-field__canvas')).toBe(true);
    });
});
