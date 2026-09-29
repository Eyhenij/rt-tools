import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { IRtDynamicSelector } from '../../rt-dynamic-selector.model';
import { RtDynamicSelectorComponent } from '../../rt-dynamic-selector.component';

/** Запись витрины: придуманный сотрудник, ни с кем не совпадающий. */
export interface IStoryPerson {
    readonly id: number;
    readonly name: string;
}

/** Набор записей витрины — правдоподобный, а не пустой: пустой показал бы отсутствие компонента. */
export const STORY_PEOPLE: readonly IStoryPerson[] = [
    { id: 1, name: 'Louisa Harbin' },
    { id: 2, name: 'Ignat Dorsey' },
    { id: 3, name: 'Saul Wexley' },
    { id: 4, name: 'Marta Konev' },
    { id: 5, name: 'Myron Tallis' },
    { id: 6, name: 'Petra Lindqvist' },
    { id: 7, name: 'Oskar Venn' },
];

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда. В пакет
 * обёртка не уезжает.
 */
@Component({
    selector: 'app-dynamic-selector',
    template: `
        <div class="app-dynamic-selector__slot">
            <rt-dynamic-selector
                keyExp="id"
                displayExp="name"
                ariaLabel="Команда"
                invitationIcon="users"
                invitationDescription="В команде пока никого нет"
                [entities]="people"
                [mode]="mode"
                [draggable]="draggable"
                [readonlyKeys]="readonlyKeys"
                [invitation]="invitation"
                [multiToggleShown]="multiToggleShown"
                [formControl]="control" />
        </div>
    `,
    styles: `
        /* Окно выбора ложится под поле: запас снизу держит его в пределах окна витрины. */
        .app-dynamic-selector__slot {
            width: 30rem;
            padding-bottom: 32rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtDynamicSelectorComponent,
    ],
})
export class TestRtDynamicSelectorComponent {
    public mode: IRtDynamicSelector.Mode = 'multi';
    public draggable: boolean = true;
    public invitation: boolean = false;
    public multiToggleShown: boolean = false;

    public readonly people: readonly IStoryPerson[] = STORY_PEOPLE;
    public readonly readonlyKeys: readonly number[] = [1];
    public readonly control: FormControl<number[] | null> = new FormControl<number[] | null>([1, 2, 3]);
}
