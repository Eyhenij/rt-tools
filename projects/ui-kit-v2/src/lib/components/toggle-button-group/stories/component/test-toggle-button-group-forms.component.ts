import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldTree, FormField, form } from '@angular/forms/signals';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IRtToggleButtonGroup } from '../../rt-toggle-button-group.model';
import { RtToggleButtonGroupComponent } from '../../rt-toggle-button-group.component';

/** Модель сигнальной формы: дни недели, выбранные множественной группой. */
interface IScheduleModel {
    days: string[];
}

const PERIOD: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'day', label: 'День' },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
];

const FORMATS: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'pdf', label: 'PDF', icon: 'attach-pdf' },
    { value: 'xlsx', label: 'Excel', icon: 'attach-xlsx-xls' },
    { value: 'docx', label: 'Word', icon: 'attach-docx-doc' },
    { value: 'zip', label: 'Архив', icon: 'attach-zip-rar' },
];

const DAYS: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'mon', label: 'Понедельник' },
    { value: 'tue', label: 'Вторник' },
    { value: 'wed', label: 'Среда' },
    { value: 'thu', label: 'Четверг' },
    { value: 'fri', label: 'Пятница' },
    { value: 'sat', label: 'Суббота' },
    { value: 'sun', label: 'Воскресенье' },
];

/**
 * Группа в форме для витрины: реактивные контролы и сигнальная форма.
 *
 * Показ — отдельный компонент, чтобы у каждой половины пары наборов были свои контролы. Angular
 * не возвращает нажатие в другие привязки того же контрола, и общий контрол оставил бы вторую
 * половину со старым значением — это читалось бы как поломка группы.
 */
@Component({
    selector: 'app-toggle-button-group-forms',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        <app-story-row caption="Реактивная форма" [items]="formNames">
            <ng-template let-formName>
                @switch (formName) {
                    @case ('одиночный') {
                        <rt-toggle-button-group ariaLabel="Период" [options]="period" [formControl]="periodControl" />
                        <span class="app-toggle-forms__value">{{ periodControl.value }}</span>
                    }
                    @case ('множественный') {
                        <rt-toggle-button-group multiple ariaLabel="Форматы" [options]="formats" [formControl]="formatsControl" />
                        <span class="app-toggle-forms__value">{{ formatsControl.value?.join(', ') }}</span>
                    }
                    @default {
                        <rt-toggle-button-group ariaLabel="Период" [options]="period" [formControl]="lockedControl" />
                        <span class="app-toggle-forms__value">{{ lockedControl.value }}</span>
                    }
                }
            </ng-template>
        </app-story-row>

        <app-story-row caption="Сигнальная форма, дни столбиком" [items]="signalNames">
            <ng-template>
                <rt-toggle-button-group multiple ariaLabel="Дни" layout="column" [options]="days" [formField]="scheduleForm.days" />
                <span class="app-toggle-forms__value">{{ schedule().days.join(', ') }}</span>
            </ng-template>
        </app-story-row>
    `,
    // native-ok: обёртка истории витрины — правила показа живут рядом с ним, а не отдельным файлом
    styles: `
        .app-toggle-forms__value {
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormField,
        ReactiveFormsModule,

        // components
        RtToggleButtonGroupComponent,

        // showcase
        StoryRowComponent,
    ],
})
export class TestRtToggleButtonGroupFormsComponent {
    public readonly period: ReadonlyArray<IRtToggleButtonGroup.Option> = PERIOD;
    public readonly formats: ReadonlyArray<IRtToggleButtonGroup.Option> = FORMATS;
    public readonly days: ReadonlyArray<IRtToggleButtonGroup.Option> = DAYS;

    public readonly formNames: readonly string[] = ['одиночный', 'множественный', 'отключён формой'];
    public readonly periodControl: FormControl<string | null> = new FormControl<string | null>('week');
    public readonly formatsControl: FormControl<string[] | null> = new FormControl<string[] | null>(['pdf', 'zip']);
    public readonly lockedControl: FormControl<string | null> = new FormControl<string | null>({ value: 'month', disabled: true });

    public readonly signalNames: readonly string[] = ['[formField]'];
    public readonly schedule: WritableSignal<IScheduleModel> = signal<IScheduleModel>({ days: ['mon', 'tue'] });
    public readonly scheduleForm: FieldTree<IScheduleModel> = form(this.schedule);
}
