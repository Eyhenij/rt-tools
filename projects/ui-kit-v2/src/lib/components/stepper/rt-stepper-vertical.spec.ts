import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtStepLabelDirective } from './rt-step-label.directive';
import { RtStepperComponent } from './rt-stepper.component';
import { IRtStepper } from './rt-stepper.model';

const STEPS: readonly IRtStepper.Step[] = [
    { label: 'Откройте письмо', description: 'Оно приходит за минуту' },
    { label: 'Перейдите по ссылке' },
    { label: 'Задайте пароль' },
    { label: 'Войдите' },
];

/** Вертикальный список с шаблоном подписи и без него: номер текущего — сигнал владельца. */
@Component({
    selector: 'rt-stepper-vertical-host',
    template: `
        <rt-stepper qa-dataid="plain" orientation="vertical" [steps]="steps" [currentIndex]="current()" />
        <rt-stepper qa-dataid="templated" orientation="vertical" [steps]="steps" [currentIndex]="-1">
            <ng-template rtStepLabel let-step let-index="index">
                @if (index === 3) {
                    Войдите под логином
                    <strong qa-dataid="login">LOGIN</strong>
                } @else {
                    {{ index + 1 }}. {{ step.label }}
                }
            </ng-template>
        </rt-stepper>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtStepperComponent, RtStepLabelDirective],
})
class VerticalHostComponent {
    public readonly steps: readonly IRtStepper.Step[] = STEPS;
    public readonly current: WritableSignal<number> = signal(1);
}

function setup(): ComponentFixture<VerticalHostComponent> {
    return createRtFixture(VerticalHostComponent);
}

function items(fixture: ComponentFixture<VerticalHostComponent>, stepper: string): HTMLElement[] {
    return [...(qa(fixture, stepper)?.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[qa-dataid="stepper-item"]')];
}

describe('RtStepperComponent — вертикальный список', (): void => {
    it('SC-UKV-902 — все шаги стоят нумерованным списком с меткой и подписью', (): void => {
        const fixture: ComponentFixture<VerticalHostComponent> = setup();
        const list: HTMLElement = (qa(fixture, 'plain')?.nativeElement as HTMLElement).querySelector(
            '[qa-dataid="stepper-list"]'
        ) as HTMLElement;

        expect(list.tagName).toBe('OL');
        expect(
            items(fixture, 'plain').map((item: HTMLElement): string => textOf(item.querySelector('[qa-dataid="stepper-mark"]')))
        ).toEqual(['1', '2', '3', '4']);
        expect(textOf(items(fixture, 'plain')[1].querySelector('[qa-dataid="stepper-step-label"]'))).toBe('Перейдите по ссылке');
        expect(qa(fixture, 'plain')?.nativeElement.querySelector('[role="progressbar"]')).toBeNull();
    });

    it('SC-UKV-902 — пройденные, текущий и будущие шаги различаются, текущий объявлен', (): void => {
        const fixture: ComponentFixture<VerticalHostComponent> = setup();
        const states: string[] = items(fixture, 'plain').map(
            (item: HTMLElement): string =>
                [...item.classList].find((name: string): boolean => name.startsWith('rt-stepper__item--state--')) ?? ''
        );

        expect(states).toEqual([
            'rt-stepper__item--state--complete',
            'rt-stepper__item--state--current',
            'rt-stepper__item--state--upcoming',
            'rt-stepper__item--state--upcoming',
        ]);
        expect(items(fixture, 'plain')[1].getAttribute('aria-current')).toBe('step');
        expect(items(fixture, 'plain')[0].hasAttribute('aria-current')).toBe(false);
    });

    it('SC-UKV-902 — пояснение рисуется только у шага, у которого оно есть', (): void => {
        const fixture: ComponentFixture<VerticalHostComponent> = setup();
        const descriptions: HTMLElement[] = items(fixture, 'plain').flatMap((item: HTMLElement): HTMLElement[] => [
            ...item.querySelectorAll<HTMLElement>('[qa-dataid="stepper-step-description"]'),
        ]);

        expect(descriptions.map((node: HTMLElement): string => textOf(node))).toEqual(['Оно приходит за минуту']);
    });

    it('SC-UKV-903 — подпись рисует шаблон с шагом и номером', (): void => {
        const fixture: ComponentFixture<VerticalHostComponent> = setup();
        const labels: string[] = items(fixture, 'templated').map((item: HTMLElement): string =>
            textOf(item.querySelector('[qa-dataid="stepper-step-label"]'))
        );

        expect(labels[0]).toBe('1. Откройте письмо');
        expect(labels[3]).toBe('Войдите под логином LOGIN');
        expect(qa(fixture, 'login')?.nativeElement.tagName).toBe('STRONG');
    });

    it('SC-UKV-904 — без текущего шага все метки нейтральные, текущим ничего не объявлено, фокуса нет', (): void => {
        const fixture: ComponentFixture<VerticalHostComponent> = setup();
        const list: HTMLElement[] = items(fixture, 'templated');

        expect(list.length).toBe(4);
        expect(list.every((item: HTMLElement): boolean => item.classList.contains('rt-stepper__item--state--neutral'))).toBe(true);
        expect(list.some((item: HTMLElement): boolean => item.hasAttribute('aria-current'))).toBe(false);
        expect((qa(fixture, 'templated')?.nativeElement as HTMLElement).querySelectorAll('[tabindex], button, a').length).toBe(0);
    });

    it('SC-UKV-904 — смена номера текущего перекрашивает шаги на месте', (): void => {
        const fixture: ComponentFixture<VerticalHostComponent> = setup();

        fixture.componentInstance.current.set(-1);
        fixture.detectChanges();

        expect(
            qaAll(fixture, 'stepper-item')
                .slice(0, 4)
                .every((item): boolean => item.nativeElement.classList.contains('rt-stepper__item--state--neutral'))
        ).toBe(true);
    });
});
