import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, hostClasses, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtLiveBadgeComponent } from './rt-live-badge.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtLiveBadgeComponent> {
    return createRtFixture(RtLiveBadgeComponent, inputs);
}

describe('RtLiveBadgeComponent', (): void => {
    it('несёт свой BEM-блок на host-е', (): void => {
        expect(hostClasses(setup())).toContain('rt-live-badge');
    });

    describe('подпись', (): void => {
        it('без входа берёт переведённую подпись кита', (): void => {
            expect(textOf(qa(setup(), 'live-badge-label'))).toBe('On the site now');
        });

        it('заданная подпись перебивает переведённую', (): void => {
            expect(textOf(qa(setup({ label: 'Смотрят сейчас' }), 'live-badge-label'))).toBe('Смотрят сейчас');
        });

        it('пустая строка равна отсутствию входа', (): void => {
            expect(textOf(qa(setup({ label: '' }), 'live-badge-label'))).toBe('On the site now');
        });
    });

    describe('счётчик', (): void => {
        it('без данных рисуется прочерк, а не ноль', (): void => {
            // Ноль и «данных ещё нет» — разные состояния: ноль посетителей при
            // живом потоке это ответ, а прочерк — его отсутствие.
            expect(textOf(qa(setup(), 'live-badge-count'))).toBe('—');
        });

        it('ноль рисуется числом', (): void => {
            expect(textOf(qa(setup({ count: 0 }), 'live-badge-count'))).toBe('0');
        });

        it('число рисуется как есть', (): void => {
            expect(textOf(qa(setup({ count: 42 }), 'live-badge-count'))).toBe('42');
        });

        it('возврат в null снова даёт прочерк', (): void => {
            const fixture: ComponentFixture<RtLiveBadgeComponent> = setup({ count: 7 });

            setInputs(fixture, { count: null });
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'live-badge-count'))).toBe('—');
        });
    });

    describe('живой поток', (): void => {
        it('без входа поток считается оборванным', (): void => {
            const fixture: ComponentFixture<RtLiveBadgeComponent> = setup();

            expect(classesOf(qa(fixture, 'live-badge'))).not.toContain('rt-live-badge--active');
            expect(qa(fixture, 'live-badge')?.attributes['data-active']).toBe('false');
        });

        it('живой поток помечается модификатором и атрибутом данных', (): void => {
            const fixture: ComponentFixture<RtLiveBadgeComponent> = setup({ active: true });

            expect(classesOf(qa(fixture, 'live-badge'))).toContain('rt-live-badge--active');
            expect(qa(fixture, 'live-badge')?.attributes['data-active']).toBe('true');
        });

        it('живость не зависит от счётчика — ноль при живом потоке остаётся активным', (): void => {
            const fixture: ComponentFixture<RtLiveBadgeComponent> = setup({ active: true, count: 0 });

            expect(classesOf(qa(fixture, 'live-badge'))).toContain('rt-live-badge--active');
            expect(textOf(qa(fixture, 'live-badge-count'))).toBe('0');
        });

        it('принимает пустую строку как истину — так пишется голый атрибут разметки', (): void => {
            expect(classesOf(qa(setup({ active: '' }), 'live-badge'))).toContain('rt-live-badge--active');
        });
    });
});
