import { Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtRadiusDirective } from './rt-radius.directive';
import { RT_RADIUS_DEFAULT, TRtRadius } from './rt-radius.model';

@Component({
    selector: 'rt-radius-host',
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    template: '<span>поверхность</span>',
})
class RadiusHostComponent {}

@Component({
    selector: 'rt-radius-page',
    imports: [RadiusHostComponent],
    template: '<rt-radius-host [radius]="step()" />',
})
class RadiusPageComponent {
    public readonly step: WritableSignal<TRtRadius | null> = signal<TRtRadius | null>(null);
}

@Component({
    selector: 'rt-radius-default-host',
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    providers: [{ provide: RT_RADIUS_DEFAULT, useValue: 'full' }],
    template: '<span>поверхность</span>',
})
class RadiusDefaultHostComponent {}

@Component({
    selector: 'rt-radius-default-page',
    imports: [RadiusDefaultHostComponent],
    template: '<rt-radius-default-host [radius]="step()" />',
})
class RadiusDefaultPageComponent {
    public readonly step: WritableSignal<TRtRadius | null> = signal<TRtRadius | null>(null);
}

describe('RtRadiusDirective', (): void => {
    describe('без умолчания хоста', (): void => {
        let fixture: ComponentFixture<RadiusPageComponent>;
        let host: HTMLElement;

        beforeEach(async (): Promise<void> => {
            await TestBed.configureTestingModule({ imports: [RadiusPageComponent] }).compileComponents();
            fixture = TestBed.createComponent(RadiusPageComponent);
            fixture.detectChanges();
            host = fixture.nativeElement.querySelector('rt-radius-host');
        });

        it('SC-UKV-383 — названный шаг ложится на хост атрибутом', (): void => {
            fixture.componentInstance.step.set('lg');
            fixture.detectChanges();

            expect(host.getAttribute('data-rt-radius')).toBe('lg');
        });

        it('SC-UKV-384 — пустой вход атрибута не оставляет', (): void => {
            expect(host).not.toBeNull();
            expect(host.hasAttribute('data-rt-radius')).toBe(false);
        });

        it('SC-UKV-385 — смена шага заменяет атрибут', (): void => {
            fixture.componentInstance.step.set('sm');
            fixture.detectChanges();
            fixture.componentInstance.step.set('2xl');
            fixture.detectChanges();

            expect(host.getAttribute('data-rt-radius')).toBe('2xl');

            fixture.componentInstance.step.set(null);
            fixture.detectChanges();

            expect(host.hasAttribute('data-rt-radius')).toBe(false);
        });
    });

    describe('с умолчанием хоста', (): void => {
        let fixture: ComponentFixture<RadiusDefaultPageComponent>;
        let host: HTMLElement;

        beforeEach(async (): Promise<void> => {
            await TestBed.configureTestingModule({ imports: [RadiusDefaultPageComponent] }).compileComponents();
            fixture = TestBed.createComponent(RadiusDefaultPageComponent);
            fixture.detectChanges();
            host = fixture.nativeElement.querySelector('rt-radius-default-host');
        });

        it('SC-UKV-384 — пустой вход берёт умолчание хоста, названный шаг его перебивает', (): void => {
            expect(host.getAttribute('data-rt-radius')).toBe('full');

            fixture.componentInstance.step.set('none');
            fixture.detectChanges();

            expect(host.getAttribute('data-rt-radius')).toBe('none');
        });
    });
});
