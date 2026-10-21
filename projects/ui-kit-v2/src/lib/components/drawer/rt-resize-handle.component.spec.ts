import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, setInputs } from '../../../testing/rt-kit-testing';
import { IRtDrawer } from './rt-drawer.model';
import { RtResizeHandleComponent } from './rt-resize-handle.component';

interface IHandleInputs {
    readonly width: number | null;
    readonly min: number;
    readonly max: number;
    readonly edge: IRtDrawer.Edge;
}

interface IHandleSetup {
    readonly fixture: ComponentFixture<RtResizeHandleComponent>;
    readonly reported: number[];
}

function setup(inputs: Partial<IHandleInputs> = {}): IHandleSetup {
    const fixture: ComponentFixture<RtResizeHandleComponent> = createRtFixture(RtResizeHandleComponent);
    const reported: number[] = [];

    setInputs(fixture, { width: 300, min: 200, max: 400, ...inputs });
    fixture.componentInstance.widthChange.subscribe((width: number): void => {
        reported.push(width);
    });
    fixture.detectChanges();

    return { fixture, reported };
}

function host(fixture: ComponentFixture<RtResizeHandleComponent>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
}

/** Событие указателя: в jsdom нет PointerEvent, и его поле добавляется к событию мыши. */
function pointer(type: string, clientX: number): MouseEvent {
    const event: MouseEvent = new MouseEvent(type, { clientX, button: 0, bubbles: true, cancelable: true });

    Object.defineProperty(event, 'pointerId', { value: 1 });
    return event;
}

function press(fixture: ComponentFixture<RtResizeHandleComponent>, key: string): void {
    host(fixture).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('RtResizeHandleComponent', (): void => {
    it('SC-UKV-938 — ручка объявлена разделителем с текущей шириной и пределами', (): void => {
        const { fixture } = setup();

        expect(host(fixture).getAttribute('role')).toBe('separator');
        expect(host(fixture).getAttribute('aria-orientation')).toBe('vertical');
        expect(host(fixture).getAttribute('tabindex')).toBe('0');
        expect(host(fixture).getAttribute('aria-valuenow')).toBe('300');
        expect(host(fixture).getAttribute('aria-valuemin')).toBe('200');
        expect(host(fixture).getAttribute('aria-valuemax')).toBe('400');
    });

    it('SC-UKV-938 — ручка у правого края панели: движение вправо расширяет, предел держит', (): void => {
        const { fixture, reported } = setup({ edge: 'end' });

        host(fixture).dispatchEvent(pointer('pointerdown', 100));
        host(fixture).dispatchEvent(pointer('pointermove', 150));
        host(fixture).dispatchEvent(pointer('pointermove', 400));
        host(fixture).dispatchEvent(pointer('pointerup', 400));
        host(fixture).dispatchEvent(pointer('pointermove', 0));

        expect(reported).toEqual([350, 400]);
    });

    it('SC-UKV-938 — ручка у левого края панели: движение влево расширяет', (): void => {
        const { fixture, reported } = setup({ edge: 'start' });

        host(fixture).dispatchEvent(pointer('pointerdown', 500));
        host(fixture).dispatchEvent(pointer('pointermove', 460));
        host(fixture).dispatchEvent(pointer('pointermove', 560));

        expect(reported).toEqual([340, 240]);
    });

    it.each<[IRtDrawer.Edge, string, number]>([
        ['end', 'ArrowRight', 316],
        ['end', 'ArrowLeft', 284],
        ['start', 'ArrowLeft', 316],
        ['start', 'ArrowRight', 284],
        ['end', 'Home', 200],
        ['end', 'End', 400],
    ])('SC-UKV-938 — край %s, клавиша %s: ширина %d', (edge: IRtDrawer.Edge, key: string, expected: number): void => {
        const { fixture, reported } = setup({ edge });

        press(fixture, key);

        expect(reported).toEqual([expected]);
    });

    it('SC-UKV-938 — на пределе стрелка ничего не сообщает', (): void => {
        const { fixture, reported } = setup({ width: 400, edge: 'end' });

        press(fixture, 'ArrowRight');

        expect(reported).toEqual([]);
    });
});
