import { Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtRippleDirective } from './rt-ripple.directive';

@Component({
    selector: 'rt-ripple-host',
    imports: [RtRippleDirective],
    template: `
        <button type="button" rtRipple [rippleDisabled]="off()" [disabled]="dead()">жми</button>
    `,
})
class RippleHostComponent {
    public readonly off: WritableSignal<boolean> = signal(false);
    public readonly dead: WritableSignal<boolean> = signal(false);
}

describe('RtRippleDirective', (): void => {
    let fixture: ComponentFixture<RippleHostComponent>;
    let button: HTMLButtonElement;

    /* jsdom не знает PointerEvent вовсе; MouseEvent того же имени несёт те же clientX и clientY,
       а больше директиве от события ничего не нужно. */
    const press: () => void = (): void => {
        button.dispatchEvent(new MouseEvent('pointerdown', { clientX: 5, clientY: 5, bubbles: true }));
    };

    const waves: () => number = (): number => button.querySelectorAll('.rt-ripple__wave').length;

    beforeEach(async (): Promise<void> => {
        jest.useFakeTimers();
        await TestBed.configureTestingModule({ imports: [RippleHostComponent] }).compileComponents();
        fixture = TestBed.createComponent(RippleHostComponent);
        fixture.detectChanges();
        button = fixture.nativeElement.querySelector('button');
    });

    afterEach((): void => {
        jest.useRealTimers();
    });

    it('нажатие ставит слой волны и убирает его, когда тот отгорит', (): void => {
        press();
        expect(waves()).toBe(1);

        jest.advanceTimersByTime(600);
        expect(waves()).toBe(0);
    });

    it('отключённая кнопка волны не даёт', (): void => {
        fixture.componentInstance.dead.set(true);
        fixture.detectChanges();

        press();
        expect(waves()).toBe(0);
    });

    it('снятая волна не ставит слой, хотя кнопка нажимается', (): void => {
        fixture.componentInstance.off.set(true);
        fixture.detectChanges();

        press();
        expect(waves()).toBe(0);
    });

    it('два нажатия подряд дают две волны, и обе гаснут', (): void => {
        press();
        press();
        expect(waves()).toBe(2);

        jest.advanceTimersByTime(600);
        expect(waves()).toBe(0);
    });
});
