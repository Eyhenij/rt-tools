import { ChangeDetectionStrategy, Component, DebugElement, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldTree, FormField, form } from '@angular/forms/signals';

import { createRtFixture, hostClasses, qaAll } from '../../../testing/rt-kit-testing';
import { IRtToggleButtonGroup } from './rt-toggle-button-group.model';
import { RtToggleButtonGroupComponent } from './rt-toggle-button-group.component';
import { RtToggleButtonOptionDirective } from './rt-toggle-button-option.directive';

const OPTIONS: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'png', label: 'PNG' },
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },
];

/** Одиночный и множественный выбор на прежней привязке. */
@Component({
    selector: 'rt-toggle-reactive-host',
    template: `
        <rt-toggle-button-group [options]="options" [formControl]="format" />
        <rt-toggle-button-group multiple [options]="options" [formControl]="formats" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToggleButtonGroupComponent, ReactiveFormsModule],
})
class ReactiveHostComponent {
    public readonly options: ReadonlyArray<IRtToggleButtonGroup.Option> = OPTIONS;
    public readonly format: FormControl<string | null> = new FormControl<string | null>('pdf');
    public readonly formats: FormControl<string[] | null> = new FormControl<string[] | null>(['png']);
}

interface IExport {
    days: string[];
}

/** Множественный выбор на сигнальной привязке. */
@Component({
    selector: 'rt-toggle-signal-host',
    template: `
        <rt-toggle-button-group multiple [options]="options" [formField]="exportForm.days" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToggleButtonGroupComponent, FormField],
})
class SignalHostComponent {
    public readonly options: ReadonlyArray<IRtToggleButtonGroup.Option> = OPTIONS;
    public readonly model: WritableSignal<IExport> = signal<IExport>({ days: ['csv'] });
    public readonly exportForm: FieldTree<IExport> = form(this.model);
}

/** Своя разметка сегмента. */
@Component({
    selector: 'rt-toggle-template-host',
    template: `
        <rt-toggle-button-group value="pdf" [options]="options">
            <ng-template rtToggleButtonOption let-option let-active="active">
                <span class="own-segment" [attr.data-active]="active">{{ option.label }}!</span>
            </ng-template>
        </rt-toggle-button-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtToggleButtonGroupComponent, RtToggleButtonOptionDirective],
})
class TemplateHostComponent {
    public readonly options: ReadonlyArray<IRtToggleButtonGroup.Option> = OPTIONS;
}

function pressed(fixture: ComponentFixture<unknown>, group: number = 0): string[] {
    const groups: HTMLElement[] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('rt-toggle-button-group'));

    // Хозяин — сама группа: тогда кнопки ищутся прямо в ней.
    const root: HTMLElement = groups[group] ?? (fixture.nativeElement as HTMLElement);

    return Array.from(root.querySelectorAll('button'))
        .filter((node: HTMLButtonElement): boolean => node.getAttribute('aria-pressed') === 'true')
        .map((node: HTMLButtonElement): string => node.dataset['value'] ?? '');
}

function press(fixture: ComponentFixture<unknown>, value: string, group: number = 0): void {
    const groups: HTMLElement[] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('rt-toggle-button-group'));
    groups[group].querySelector<HTMLButtonElement>(`button[data-value="${value}"]`)?.click();
    fixture.detectChanges();
}

describe('rt-toggle-button-group и формы', (): void => {
    describe('SC-UKV-919: значение из формы', (): void => {
        it('форма пишет значение одиночного и множественного выбора', (): void => {
            const fixture: ComponentFixture<ReactiveHostComponent> = createRtFixture(ReactiveHostComponent);
            fixture.detectChanges();

            expect(pressed(fixture, 0)).toEqual(['pdf']);
            expect(pressed(fixture, 1)).toEqual(['png']);

            fixture.componentInstance.format.setValue('csv');
            fixture.detectChanges();
            expect(pressed(fixture, 0)).toEqual(['csv']);
        });

        it('нажатие пишет значение в форму и помечает контрол тронутым', (): void => {
            const fixture: ComponentFixture<ReactiveHostComponent> = createRtFixture(ReactiveHostComponent);
            fixture.detectChanges();

            press(fixture, 'png', 0);
            press(fixture, 'csv', 1);

            expect(fixture.componentInstance.format.value).toBe('png');
            expect(fixture.componentInstance.format.touched).toBe(true);
            expect(fixture.componentInstance.formats.value).toEqual(['png', 'csv']);
            expect(pressed(fixture, 1)).toEqual(['png', 'csv']);
        });

        it('отключённый формой контрол нажатий не принимает', (): void => {
            const fixture: ComponentFixture<ReactiveHostComponent> = createRtFixture(ReactiveHostComponent);
            fixture.componentInstance.format.disable();
            fixture.detectChanges();

            press(fixture, 'png', 0);

            expect(fixture.componentInstance.format.value).toBe('pdf');
            expect(pressed(fixture, 0)).toEqual(['pdf']);
        });

        it('сигнальная форма пишет и читает набор', (): void => {
            const fixture: ComponentFixture<SignalHostComponent> = createRtFixture(SignalHostComponent);
            fixture.detectChanges();
            expect(pressed(fixture)).toEqual(['csv']);

            press(fixture, 'pdf');

            expect(fixture.componentInstance.model().days).toEqual(['csv', 'pdf']);
        });
    });

    describe('SC-UKV-920: своя разметка сегмента', (): void => {
        it('шаблон стоит на месте подписи и знает, нажат ли сегмент', (): void => {
            const fixture: ComponentFixture<TemplateHostComponent> = createRtFixture(TemplateHostComponent);
            fixture.detectChanges();

            const own: HTMLElement[] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.own-segment'));
            expect(own.map((node: HTMLElement): string => node.textContent ?? '')).toEqual(['PNG!', 'PDF!', 'CSV!']);
            expect(own.map((node: HTMLElement): string | null => node.getAttribute('data-active'))).toEqual(['false', 'true', 'false']);
            expect((fixture.nativeElement as HTMLElement).querySelector('.rt-toggle-button-group__label')).toBeNull();
        });
    });

    describe('SC-UKV-921: перенос и столбик', (): void => {
        it.each<[IRtToggleButtonGroup.Layout, string | null]>([
            ['row', null],
            ['wrap', 'rt-toggle-button-group--wrap'],
            ['column', 'rt-toggle-button-group--column'],
        ])('раскладка %s ставит свой модификатор', (layout: IRtToggleButtonGroup.Layout, modifier: string | null): void => {
            const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = createRtFixture(RtToggleButtonGroupComponent<string>, {
                options: OPTIONS,
                layout,
            });
            const classes: string[] = hostClasses(fixture).filter((cls: string): boolean => /--(wrap|column)$/.test(cls));

            expect(classes).toEqual(modifier === null ? [] : [modifier]);
        });

        it('без формы группа по-прежнему ждёт ответа хозяина', (): void => {
            const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = createRtFixture(RtToggleButtonGroupComponent<string>, {
                options: OPTIONS,
                value: 'pdf',
            });
            qaAll(fixture, 'toggle-button-group-option').forEach((node: DebugElement, index: number): void => {
                if (index === 0) {
                    (node.nativeElement as HTMLButtonElement).click();
                }
            });
            fixture.detectChanges();

            expect(pressed(fixture)).toEqual(['pdf']);
        });
    });
});
