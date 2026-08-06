import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { IRtStepper } from './rt-stepper.model';
import { RtStepperComponent } from './rt-stepper.component';

const STEPS: ReadonlyArray<IRtStepper.Step> = [
    { label: 'Заявка', description: 'Заполните данные' },
    { label: 'Проверка', description: 'Ждём подтверждения' },
    { label: 'Готово', description: 'Договор подписан\n\nМожно приступать' },
];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtStepperComponent> {
    return createRtFixture(RtStepperComponent, { steps: STEPS, ...inputs });
}

function progressWidth(fixture: ComponentFixture<RtStepperComponent>): string {
    return (qa(fixture, 'stepper-progress')?.nativeElement as HTMLElement).style.width;
}

describe('RtStepperComponent', (): void => {
    it('рисует по точке на каждый шаг', (): void => {
        expect(qaAll(setup(), 'stepper-point').length).toBe(3);
    });

    it('подпись показывает только текущий шаг', (): void => {
        expect(textOf(qa(setup({ currentIndex: 1 }), 'stepper-label'))).toBe('Проверка');
    });

    describe('точки', (): void => {
        it('пройденные помечены завершёнными, текущая — текущей', (): void => {
            const fixture: ComponentFixture<RtStepperComponent> = setup({ currentIndex: 1 });
            const points: string[][] = qaAll(fixture, 'stepper-point').map((node: DebugElement): string[] => classesOf(node));

            expect(points[0]).toContain('rt-stepper__point--complete');
            expect(points[1]).toContain('rt-stepper__point--current');
            expect(points[2]).not.toContain('rt-stepper__point--complete');
        });

        it('точки спрятаны от скринридера — прогресс он читает с самой полосы', (): void => {
            const fixture: ComponentFixture<RtStepperComponent> = setup();

            expect(qaAll(fixture, 'stepper-point').every((node: DebugElement): boolean => node.attributes['aria-hidden'] === 'true')).toBe(
                true
            );
        });
    });

    describe('заполнение', (): void => {
        it.each<[number, string]>([
            [0, '0%'],
            [1, '50%'],
            [2, '100%'],
        ])('шаг %i заполняет полосу на %s', (currentIndex: number, expected: string): void => {
            expect(progressWidth(setup({ currentIndex }))).toBe(expected);
        });

        it('единственный шаг не заполняет полосу — делить не на что', (): void => {
            const fixture: ComponentFixture<RtStepperComponent> = setup({ steps: [STEPS[0]], currentIndex: 0 });

            expect(progressWidth(fixture)).toBe('0%');
        });

        it('шаг за пределами набора не выводит полосу за сто процентов', (): void => {
            expect(progressWidth(setup({ currentIndex: 99 }))).toBe('100%');
        });
    });

    describe('описание', (): void => {
        it('рисуется под полосой', (): void => {
            expect(textOf(qa(setup(), 'stepper-description'))).toBe('Заполните данные');
        });

        it('пустая строка между абзацами разбивает описание на несколько', (): void => {
            const fixture: ComponentFixture<RtStepperComponent> = setup({ currentIndex: 2 });

            expect(qaAll(fixture, 'stepper-description').map((node: DebugElement): string => textOf(node))).toEqual([
                'Договор подписан',
                'Можно приступать',
            ]);
        });

        it('пустое описание не создаёт пустого абзаца', (): void => {
            const fixture: ComponentFixture<RtStepperComponent> = setup({ steps: [{ label: 'Шаг', description: '' }] });

            expect(qaAll(fixture, 'stepper-description').length).toBe(0);
        });
    });

    describe('доступность', (): void => {
        it('полоса объявлена индикатором прогресса с границами и текущим значением', (): void => {
            const strip: HTMLElement = qa(setup({ currentIndex: 1 }), 'stepper')?.nativeElement as HTMLElement;

            expect(strip.getAttribute('role')).toBe('progressbar');
            expect(strip.getAttribute('aria-valuemin')).toBe('0');
            expect(strip.getAttribute('aria-valuemax')).toBe('3');
            expect(strip.getAttribute('aria-valuenow')).toBe('2');
        });

        it('текущее значение проговаривается подписью шага, а не числом', (): void => {
            const strip: HTMLElement = qa(setup({ currentIndex: 1 }), 'stepper')?.nativeElement as HTMLElement;

            expect(strip.getAttribute('aria-valuetext')).toBe('Проверка');
        });
    });

    it('пустой набор шагов не роняет отрисовку', (): void => {
        const fixture: ComponentFixture<RtStepperComponent> = setup({ steps: [] });

        expect(qaAll(fixture, 'stepper-point').length).toBe(0);
        expect(qa(fixture, 'stepper-label')).toBeNull();
    });

    it('номер шага принимает строку — так значение приходит из атрибута разметки', (): void => {
        expect(textOf(qa(setup({ currentIndex: '2' }), 'stepper-label'))).toBe('Готово');
    });
});
