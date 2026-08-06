import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, setInputs } from '../../../testing/rt-kit-testing';
import { RtSpinnerComponent } from './rt-spinner.component';
import { IRtSpinner } from './rt-spinner.model';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtSpinnerComponent> {
    return createRtFixture(RtSpinnerComponent, inputs);
}

function diameterVar(fixture: ComponentFixture<RtSpinnerComponent>): string {
    return (fixture.nativeElement as HTMLElement).style.getPropertyValue('--rt-spinner-diameter');
}

describe('RtSpinnerComponent', (): void => {
    it('без входов рисуется основной палитрой', (): void => {
        expect(hostClasses(setup())).toEqual(expect.arrayContaining(['rt-spinner', 'rt-spinner--primary']));
    });

    it.each<IRtSpinner.Color>(['primary', 'neutral', 'on-primary'])('палитра %s даёт свой модификатор', (color: IRtSpinner.Color): void => {
        expect(hostClasses(setup({ color }))).toContain(`rt-spinner--${color}`);
    });

    it('смена палитры снимает прежний модификатор', (): void => {
        const fixture: ComponentFixture<RtSpinnerComponent> = setup({ color: 'neutral' });

        setInputs(fixture, { color: 'on-primary' });
        fixture.detectChanges();

        expect(hostClasses(fixture)).toContain('rt-spinner--on-primary');
        expect(hostClasses(fixture)).not.toContain('rt-spinner--neutral');
    });

    describe('диаметр', (): void => {
        it('без входа — 32px', (): void => {
            expect(diameterVar(setup())).toBe('32px');
        });

        it('едет свойством оформления, а не классом: размер задаётся произвольным числом', (): void => {
            expect(diameterVar(setup({ diameter: 18 }))).toBe('18px');
        });

        it('принимает строку — так значение приходит из атрибута разметки', (): void => {
            expect(diameterVar(setup({ diameter: '48' }))).toBe('48px');
        });
    });

    describe('доступность', (): void => {
        it('объявлен статусной областью, о которой скринридер сообщает не перебивая', (): void => {
            const host: HTMLElement = setup().nativeElement as HTMLElement;

            expect(host.getAttribute('role')).toBe('status');
            expect(host.getAttribute('aria-live')).toBe('polite');
        });
    });

    it('своей разметки не рисует — вращается на псевдоэлементах host-а', (): void => {
        expect((setup().nativeElement as HTMLElement).children.length).toBe(0);
    });
});
