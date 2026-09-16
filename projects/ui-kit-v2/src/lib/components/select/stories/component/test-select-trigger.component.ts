import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { STORY_FIELD_WIDTH } from '../../../../../showcase/story-metrics';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import {
    IStoryState,
    STORY_STATE_DEFAULT,
    STORY_STATE_FOCUS,
    STORY_STATE_FOCUS_VISIBLE,
    STORY_STATE_HOVER,
    storyStateLabel,
} from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtMultiselectComponent } from '../../../multiselect/rt-multiselect.component';
import { RtTagComponent } from '../../../tag/rt-tag.component';
import { RtSelectTriggerDirective } from '../../rt-select-trigger.directive';
import { RtSelectComponent } from '../../rt-select.component';
import { IRtSelect } from '../../rt-select.model';

/** Какую матрицу указателя рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TSelectTriggerPart = 'against' | 'families' | 'states' | 'presets' | 'themes';

/** Чей указатель рисуется в ячейке: зашитый китом или свой, объявленный шаблоном. */
interface ITriggerSideCase {
    readonly name: string;
    readonly own: boolean;
    readonly control: FormControl<string | null>;
}

/** Какая семья рисуется в ячейке: выбор одного значения или выбор нескольких. */
interface ITriggerFamilyCase {
    readonly name: string;
    readonly many: boolean;
}

/** Случай пары тем: подпись ряда и значение, по которому видно метку потребителя. */
interface ITriggerThemeCase {
    readonly name: string;
    readonly control: FormControl<string | null>;
}

const CITIES: readonly IRtSelect.Option<string>[] = [
    { value: 'msk', label: 'Москва' },
    { value: 'spb', label: 'Санкт-Петербург' },
    { value: 'kzn', label: 'Казань' },
];

function chosen(value: string | null): FormControl<string | null> {
    return new FormControl<string | null>(value);
}

/**
 * Обёртка страницы своего указателя выбора.
 *
 * Отдельная от матрицы выбора намеренно: указатель — вход обеих семей, а не ось одной из них. Внутри
 * матрицы он стоял одной строкой из десяти, и найти его там можно было, только зная, что он там
 * есть.
 */
@Component({
    selector: 'app-test-select-trigger',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        RtMultiselectComponent,
        RtSelectComponent,
        RtSelectTriggerDirective,
        RtTagComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
    template: `
        @switch (part) {
            @case ('against') {
                <app-story-presets caption="Зашитый китом указатель и свой, в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="sideCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-sideCase>
                                @if (sideCase.own) {
                                    <rt-select
                                        ariaLabel="Город"
                                        placeholder="Выберите город"
                                        [options]="options"
                                        [formControl]="sideCase.control">
                                        <ng-template rtSelectTrigger let-state>
                                            <rt-tag severity="info" [value]="state.label || 'Город'" />
                                        </ng-template>
                                    </rt-select>
                                } @else {
                                    <rt-select
                                        ariaLabel="Город"
                                        placeholder="Выберите город"
                                        [options]="options"
                                        [formControl]="sideCase.control" />
                                }
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('families') {
                <app-story-presets caption="Один вход на обе семьи: выбор одного значения и выбор нескольких">
                    <ng-template>
                        <app-story-row [items]="familyCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-familyCase>
                                @if (familyCase.many) {
                                    <rt-multiselect
                                        ariaLabel="Города"
                                        placeholder="Выберите города"
                                        [options]="options"
                                        [formControl]="manyControl">
                                        <ng-template rtSelectTrigger let-state>
                                            <rt-tag severity="info" [value]="'Городов: ' + state.value.length" />
                                        </ng-template>
                                    </rt-multiselect>
                                } @else {
                                    <rt-select
                                        ariaLabel="Город"
                                        placeholder="Выберите город"
                                        [options]="options"
                                        [formControl]="oneControl">
                                        <ng-template rtSelectTrigger let-state>
                                            <rt-tag severity="info" [value]="state.label || 'Город'" />
                                        </ng-template>
                                    </rt-select>
                                }
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-row
                    caption="Состояния своего указателя: полевого кольца у него нет ни в одном"
                    [items]="stateCases"
                    [itemLabel]="stateLabel"
                    [slotWidth]="fieldWidth">
                    <ng-template let-stateCase>
                        <rt-select
                            ariaLabel="Город"
                            placeholder="Выберите город"
                            [options]="options"
                            [formControl]="statesControl"
                            [attr.data-story-state]="stateCase.state">
                            <ng-template rtSelectTrigger let-state>
                                <rt-tag severity="info" [value]="state.label || 'Город'" />
                            </ng-template>
                        </rt-select>
                    </ng-template>
                </app-story-row>
            }

            @case ('presets') {
                <app-story-presets caption="Свой указатель в обоих наборах оформления">
                    <ng-template>
                        <app-story-row [items]="themeCases" [itemLabel]="caseLabel">
                            <ng-template let-themeCase>
                                <rt-select
                                    ariaLabel="Город"
                                    placeholder="Выберите город"
                                    [options]="options"
                                    [formControl]="themeCase.control">
                                    <ng-template rtSelectTrigger let-state>
                                        <rt-tag severity="info" [value]="state.label || 'Город'" />
                                    </ng-template>
                                </rt-select>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Свой указатель в светлой и тёмной теме">
                    <ng-template>
                        <app-story-row [items]="themeCases" [itemLabel]="caseLabel">
                            <ng-template let-themeCase>
                                <rt-select
                                    ariaLabel="Город"
                                    placeholder="Выберите город"
                                    [options]="options"
                                    [formControl]="themeCase.control">
                                    <ng-template rtSelectTrigger let-state>
                                        <rt-tag severity="info" [value]="state.label || 'Город'" />
                                    </ng-template>
                                </rt-select>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
})
export class TestRtSelectTriggerComponent {
    /** Какую матрицу рисовать: истории различаются только этим входом. */
    public part: TSelectTriggerPart = 'against';

    public readonly options: readonly IRtSelect.Option<string>[] = CITIES;

    /** Ширина ячейки ряда: у зашитого указателя вид поля, и без неё пара мерится по-разному. */
    public readonly fieldWidth: string = STORY_FIELD_WIDTH;

    /**
     * Пара указателей: зашитый китом и свой. Пара стоит в одном кадре — порознь ни одна половина не
     * показывает, чем она отличается от другой.
     */
    public readonly sideCases: readonly ITriggerSideCase[] = [
        { name: 'указатель кита', own: false, control: chosen('spb') },
        { name: 'свой указатель', own: true, control: chosen('spb') },
    ];

    /** Обе семьи принимают один и тот же вход, и разница у них только внутри кнопки. */
    public readonly familyCases: readonly ITriggerFamilyCase[] = [
        { name: 'выбор одного', many: false },
        { name: 'выбор нескольких', many: true },
    ];

    /**
     * Состояния своего указателя. Взяты оба фокуса: у зашитого указателя полевое кольцо рисуется и
     * на `:focus`, а у своего не должно рисоваться ни на нём, ни на ходе клавишами — там вместо
     * кольца обводка по содержимому кнопки.
     */
    public readonly stateCases: readonly IStoryState[] = [
        STORY_STATE_DEFAULT,
        STORY_STATE_HOVER,
        STORY_STATE_FOCUS,
        STORY_STATE_FOCUS_VISIBLE,
    ];

    public readonly themeCases: readonly ITriggerThemeCase[] = [
        { name: 'со значением', control: chosen('msk') },
        { name: 'без значения', control: chosen(null) },
    ];

    public readonly oneControl: FormControl<string | null> = chosen('spb');

    public readonly manyControl: FormControl<readonly string[] | null> = new FormControl<readonly string[] | null>(['msk', 'spb']);

    public readonly statesControl: FormControl<string | null> = chosen('spb');

    /** Подпись состояния для ряда. */
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** Подпись случая: у всех наборов этой страницы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
