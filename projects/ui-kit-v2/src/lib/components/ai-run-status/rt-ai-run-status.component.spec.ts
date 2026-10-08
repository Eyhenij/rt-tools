import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RtIconComponent } from '../icon/rt-icon.component';
import { IRtTimeline } from '../timeline/rt-timeline.model';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';

import { classesOf, createRtFixture, hostClasses, qa, qaAll, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtAiRunStatusComponent } from './rt-ai-run-status.component';

const STEPS: readonly IRtTimeline.Step[] = [
    { label: 'Fetching daily performance briefing', meta: '14s', status: 'complete' },
    { label: 'Working out the answer', meta: '5s', status: 'complete' },
];

/** Имя значка состояния. */
function markName(fixture: ComponentFixture<RtAiRunStatusComponent>): string | null {
    return fixture.debugElement.query(By.css('.rt-ai-run-status__mark')).query(By.directive(RtIconComponent)).componentInstance.name();
}

/** Текст подсказки на строке-кнопке. */
function toggleTooltip(fixture: ComponentFixture<RtAiRunStatusComponent>): string {
    return fixture.debugElement.query(By.directive(RtTooltipDirective)).injector.get(RtTooltipDirective).text();
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtAiRunStatusComponent> {
    return createRtFixture(RtAiRunStatusComponent, { state: 'running', label: 'Thinking…', ...inputs });
}

describe('RtAiRunStatusComponent', (): void => {
    it('несёт свой BEM-блок на host-е', (): void => {
        expect(hostClasses(setup())).toContain('rt-ai-run-status');
    });

    describe('отметка состояния', (): void => {
        it('SC-UKV-735 — пока ответ идёт, на месте значка крутилка', (): void => {
            const fixture: ComponentFixture<RtAiRunStatusComponent> = setup();

            expect(fixture.nativeElement.querySelector('.rt-ai-run-status__mark rt-spinner')).not.toBeNull();
            expect(fixture.nativeElement.querySelector('.rt-ai-run-status__mark rt-icon')).toBeNull();
        });

        it.each([
            ['done', 'check-circle'],
            ['stopped', 'times-circle'],
            ['failed', 'exclamation-circle'],
        ])('SC-UKV-735 — состояние %s рисует значок %s', (state: string, icon: string): void => {
            const fixture: ComponentFixture<RtAiRunStatusComponent> = setup({ state });

            expect(fixture.nativeElement.querySelector('.rt-ai-run-status__mark rt-icon')).not.toBeNull();
            expect(fixture.nativeElement.querySelector('.rt-ai-run-status__mark rt-spinner')).toBeNull();
            expect(qa(fixture, 'ai-run-status')?.attributes['data-state']).toBe(state);
            expect(markName(fixture)).toBe(icon);
        });
    });

    describe('подпись', (): void => {
        it('SC-UKV-736 — пока ответ идёт, подпись помечена бликом', (): void => {
            expect(classesOf(qa(setup(), 'ai-run-status-label'))).toContain('rt-ai-run-status__label--state--running');
        });

        it('SC-UKV-737 — остановленная и упавшая подписи помечены своим состоянием', (): void => {
            expect(classesOf(qa(setup({ state: 'stopped' }), 'ai-run-status-label'))).toContain('rt-ai-run-status__label--state--stopped');
            expect(classesOf(qa(setup({ state: 'failed' }), 'ai-run-status-label'))).toContain('rt-ai-run-status__label--state--failed');
        });

        it('показывает переданный текст', (): void => {
            expect(textOf(qa(setup({ label: 'Worked for 31s', state: 'done' }), 'ai-run-status-label'))).toBe('Worked for 31s');
        });
    });

    describe('мета', (): void => {
        it('SC-UKV-738 — пустая мета не рисуется', (): void => {
            expect(qa(setup(), 'ai-run-status-meta')).toBeNull();
        });

        it('SC-UKV-738 — заданная мета стоит справа от подписи', (): void => {
            expect(textOf(qa(setup({ meta: '14s' }), 'ai-run-status-meta'))).toBe('14s');
        });
    });

    describe('шаги', (): void => {
        it('SC-UKV-740 — без шагов строка не кнопка и объявляется как статус', (): void => {
            const fixture: ComponentFixture<RtAiRunStatusComponent> = setup();

            expect(qa(fixture, 'ai-run-status-toggle')).toBeNull();
            expect(qa(fixture, 'ai-run-status-row')?.attributes['role']).toBe('status');
        });

        it('SC-UKV-739 — с шагами строка — кнопка, список закрыт, подпись «Show steps»', (): void => {
            const fixture: ComponentFixture<RtAiRunStatusComponent> = setup({ state: 'done', steps: STEPS });
            const toggle: HTMLButtonElement = qa(fixture, 'ai-run-status-toggle')?.nativeElement;

            expect(toggle.tagName).toBe('BUTTON');
            expect(toggle.getAttribute('aria-expanded')).toBe('false');
            expect(qa(fixture, 'ai-run-status-steps')).toBeNull();
            expect(toggleTooltip(fixture)).toBe('Show steps');
        });

        it('SC-UKV-739 — нажатие раскрывает список и сообщает об этом наружу', (): void => {
            const fixture: ComponentFixture<RtAiRunStatusComponent> = setup({ state: 'done', steps: STEPS });
            const seen: boolean[] = [];
            fixture.componentInstance.expanded.subscribe((value: boolean): number => seen.push(value));

            qa(fixture, 'ai-run-status-toggle')?.nativeElement.click();
            fixture.detectChanges();

            expect(qa(fixture, 'ai-run-status-toggle')?.attributes['aria-expanded']).toBe('true');
            expect(qaAll(fixture, 'timeline-item')).toHaveLength(2);
            expect(toggleTooltip(fixture)).toBe('Hide steps');
            expect(seen).toEqual([true]);
        });

        it('SC-UKV-741 — состояние списка задаётся снаружи', (): void => {
            const fixture: ComponentFixture<RtAiRunStatusComponent> = setup({ state: 'done', steps: STEPS, expanded: true });

            expect(qa(fixture, 'ai-run-status-steps')).not.toBeNull();

            setInputs(fixture, { expanded: false });
            fixture.detectChanges();

            expect(qa(fixture, 'ai-run-status-steps')).toBeNull();
        });

        it('раскрытый список без шагов не рисуется', (): void => {
            expect(qa(setup({ expanded: true }), 'ai-run-status-steps')).toBeNull();
        });
    });
});
