import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, els, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { IRtTimeline } from './rt-timeline.model';
import { RtTimelineComponent } from './rt-timeline.component';

const STEPS: ReadonlyArray<IRtTimeline.Step> = [
    { label: 'Заявка создана', meta: '12 марта, 10:00', actor: 'Иванов', status: 'complete' },
    { label: 'На проверке', meta: '12 марта, 12:30', status: 'current' },
    { label: 'Решение', status: 'pending' },
];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtTimelineComponent> {
    return createRtFixture(RtTimelineComponent, { steps: STEPS, ...inputs });
}

function items(fixture: ComponentFixture<RtTimelineComponent>): HTMLElement[] {
    return qaAll(fixture, 'timeline-item').map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement);
}

describe('RtTimelineComponent', (): void => {
    it('рисуется нумерованным списком — порядок шагов здесь смысловой', (): void => {
        expect((qa(setup(), 'timeline')?.nativeElement as HTMLElement).tagName).toBe('OL');
    });

    it('рисует по пункту на каждый шаг', (): void => {
        expect(qaAll(setup(), 'timeline-item-label').map((node: DebugElement): string => textOf(node))).toEqual([
            'Заявка создана',
            'На проверке',
            'Решение',
        ]);
    });

    describe('состояние шага', (): void => {
        it.each<IRtTimeline.Status>(['complete', 'current', 'pending'])(
            'состояние %s помечает пункт модификатором и атрибутом данных',
            (status: IRtTimeline.Status): void => {
                const fixture: ComponentFixture<RtTimelineComponent> = setup({ steps: [{ label: 'Шаг', status }] });

                expect(classesOf(items(fixture)[0])).toContain(`rt-timeline__item--status--${status}`);
                expect(items(fixture)[0].getAttribute('data-status')).toBe(status);
            }
        );
    });

    describe('подробности шага', (): void => {
        it('время и исполнитель рисуются, когда переданы', (): void => {
            const fixture: ComponentFixture<RtTimelineComponent> = setup();

            expect(textOf(qaAll(fixture, 'timeline-item-time')[0])).toBe('12 марта, 10:00');
            expect(textOf(qaAll(fixture, 'timeline-item-actor')[0])).toBe('Иванов');
        });

        it('шаг без подробностей рисует одну подпись', (): void => {
            const fixture: ComponentFixture<RtTimelineComponent> = setup({ steps: [{ label: 'Решение', status: 'pending' }] });

            expect(qa(fixture, 'timeline-item-time')).toBeNull();
            expect(qa(fixture, 'timeline-item-actor')).toBeNull();
        });

        it('исполнитель без времени допустим', (): void => {
            const fixture: ComponentFixture<RtTimelineComponent> = setup({
                steps: [{ label: 'Решение', actor: 'Петров', status: 'pending' }],
            });

            expect(textOf(qa(fixture, 'timeline-item-actor'))).toBe('Петров');
            expect(qa(fixture, 'timeline-item-time')).toBeNull();
        });
    });

    describe('соединительная линия', (): void => {
        it('рисуется между шагами, но не после последнего', (): void => {
            // Хвост линии под последним шагом читался бы как «продолжение есть».
            const fixture: ComponentFixture<RtTimelineComponent> = setup();

            expect(els(fixture, '.rt-timeline__line').length).toBe(STEPS.length - 1);
        });

        it('у единственного шага линии нет вовсе', (): void => {
            const fixture: ComponentFixture<RtTimelineComponent> = setup({ steps: [STEPS[0]] });

            expect(els(fixture, '.rt-timeline__line').length).toBe(0);
        });
    });

    it('пустой набор рисует пустой список', (): void => {
        const fixture: ComponentFixture<RtTimelineComponent> = setup({ steps: [] });

        expect(items(fixture).length).toBe(0);
        expect(qa(fixture, 'timeline')).not.toBeNull();
    });
});
