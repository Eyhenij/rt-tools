import { ComponentFixture } from '@angular/core/testing';

import { BreakpointsService } from '../../platform';
import { createRtFixture, hostClasses, qa, qaAll } from '../../../testing/rt-kit-testing';
import { IRtFilterControl } from './rt-filter-control.model';
import { RtFilterControlComponent } from './rt-filter-control.component';

const OPTIONS: ReadonlyArray<IRtFilterControl.Option> = [
    { value: 'all', label: 'Все' },
    { value: 'active', label: 'Активные', icon: 'check' },
    { value: 'done', label: 'Завершённые' },
];

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class NarrowBreakpointsService {
    public readonly narrow: () => boolean = (): boolean => true;
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtFilterControlComponent<string>> {
    return createRtFixture(RtFilterControlComponent<string>, { options: OPTIONS, ...inputs });
}

function setupNarrow(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtFilterControlComponent<string>> {
    return createRtFixture(
        RtFilterControlComponent<string>,
        { options: OPTIONS, ...inputs },
        { providers: [{ provide: BreakpointsService, useClass: NarrowBreakpointsService }] }
    );
}

describe('RtFilterControlComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-filter-control');
    });

    describe('широкий экран', (): void => {
        it('рисуется группой кнопок', (): void => {
            expect(qa(setup(), 'filter-control-group')).not.toBeNull();
            expect(qa(setup(), 'filter-control-select')).toBeNull();
        });

        it('варианты доезжают до группы вместе с иконками', (): void => {
            const fixture: ComponentFixture<RtFilterControlComponent<string>> = setup();

            expect(qaAll(fixture, 'toggle-button-group-option').length).toBe(3);
        });

        it('нажатие кнопки просит сменить значение', (): void => {
            const fixture: ComponentFixture<RtFilterControlComponent<string>> = setup({ value: 'all' });
            const picked: string[] = [];
            fixture.componentInstance.valueChange.subscribe((value: string): void => {
                picked.push(value);
            });

            (qaAll(fixture, 'toggle-button-group-option')[1].nativeElement as HTMLButtonElement).click();
            fixture.detectChanges();

            expect(picked).toEqual(['active']);
        });
    });

    describe('узкий экран', (): void => {
        it('тот же фильтр рисуется списком — сегменты в строку не помещаются', (): void => {
            // Компонент выбирает представление сам, по ширине вьюпорта:
            // потребитель об этом не думает и передаёт один и тот же набор.
            const fixture: ComponentFixture<RtFilterControlComponent<string>> = setupNarrow();

            expect(qa(fixture, 'filter-control-select')).not.toBeNull();
            expect(qa(fixture, 'filter-control-group')).toBeNull();
        });

        it('варианты превращаются в опции списка без иконок', (): void => {
            const fixture: ComponentFixture<RtFilterControlComponent<string>> = setupNarrow();

            qa(fixture, 'filter-control-select')?.nativeElement.querySelector('[qa-dataid="select-trigger"]').click();
            fixture.detectChanges();

            expect(
                Array.from(document.querySelectorAll('[qa-dataid="select-option"]')).map((n: Element): string => n.textContent.trim())
            ).toEqual(['Все', 'Активные', 'Завершённые']);
        });

        it('выбор в списке просит сменить значение', (): void => {
            const fixture: ComponentFixture<RtFilterControlComponent<string>> = setupNarrow();
            const picked: string[] = [];
            fixture.componentInstance.valueChange.subscribe((value: string): void => {
                picked.push(value);
            });

            qa(fixture, 'filter-control-select')?.nativeElement.querySelector('[qa-dataid="select-trigger"]').click();
            fixture.detectChanges();
            (document.querySelectorAll('[qa-dataid="select-option"]')[2] as HTMLElement).click();
            fixture.detectChanges();

            expect(picked).toEqual(['done']);
        });

        it('очистка списка выключена — фильтр всегда в каком-то состоянии', (): void => {
            const fixture: ComponentFixture<RtFilterControlComponent<string>> = setupNarrow({ value: 'done' });

            expect(qa(fixture, 'filter-control-select')?.nativeElement.querySelector('.rt-select__clear')).toBeNull();
        });
    });

    it('отключение доходит до обоих представлений', (): void => {
        expect((qaAll(setup({ disabled: true }), 'toggle-button-group-option')[0].nativeElement as HTMLButtonElement).disabled).toBe(true);
        expect(
            (setupNarrow({ disabled: true }).nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[qa-dataid="select-trigger"]')
                ?.disabled
        ).toBe(true);
    });
});
