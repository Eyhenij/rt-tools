import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtDynamicInputComponent } from '../../dynamic-input/rt-dynamic-input.component';
import { RtDynamicSelectorPopupComponent } from '../../popup/rt-dynamic-selector-popup.component';
import { RtDynamicSelectorComponent } from '../../rt-dynamic-selector.component';
import { RtDynamicSelectorRowControlsDirective, RtDynamicSelectorRowTitleDirective } from '../../rt-dynamic-selector.directives';
import { IRtDynamicSelector } from '../../rt-dynamic-selector.model';
import { IStoryPerson, STORY_PEOPLE } from './test-dynamic-selector.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TDynamicSelectorMatrixPart = 'rows' | 'templates' | 'invitation' | 'states' | 'popup' | 'input' | 'presets' | 'themes';

/** Случай списка выбранного: что показано строками и что с ними можно сделать. */
interface IRowsCase {
    readonly name: string;
    readonly draggable: boolean;
    readonly readonlyKeys: readonly number[];
    readonly control: FormControl<number[] | null>;
}

/** Случай окна выбора: окно поставлено прямо в разметку, в оверлее оно было бы одно. */
interface IPopupCase {
    readonly name: string;
    readonly entities: readonly IStoryPerson[];
    readonly mode: IRtDynamicSelector.Mode;
    readonly multiToggleShown: boolean;
    readonly loading: boolean;
    readonly pinnedKeys: readonly number[];
}

/** Случай поля строк. */
interface IInputCase {
    readonly name: string;
    readonly editable: boolean;
    readonly draggable: boolean;
    readonly readonlyKeys: readonly string[];
    readonly control: FormControl<string[] | null>;
}

/** Адреса поля строк — придуманные, в зарезервированном для примеров домене. */
const NORTH: string = 'north@example.test';
const SOUTH: string = 'south@example.test';

function chosen(keys: number[]): FormControl<number[] | null> {
    return new FormControl<number[] | null>(keys);
}

function disabled(keys: number[]): FormControl<number[] | null> {
    return new FormControl<number[] | null>({ value: keys, disabled: true });
}

function texts(values: string[]): FormControl<string[] | null> {
    return new FormControl<string[] | null>(values);
}

/**
 * Матрицы состояний `rt-dynamic-selector` для витрины.
 *
 * Оси не перемножены: перетаскивание, строки только для чтения и отключение меняют разные части
 * строки и вместе ничего нового не показывают. Окно выбора стоит в разметке, а не в оверлее:
 * открытое окно в истории было бы ровно одно, а случаев у него шесть.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-dynamic-selector-matrix',
    template: `
        @switch (part) {
            @case ('rows') {
                <app-story-presets caption="Список выбранного в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="rowsCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-rowsCase>
                                <rt-dynamic-selector
                                    keyExp="id"
                                    displayExp="name"
                                    [ariaLabel]="rowsCase.name"
                                    [entities]="people"
                                    [draggable]="rowsCase.draggable"
                                    [readonlyKeys]="rowsCase.readonlyKeys"
                                    [formControl]="rowsCase.control" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('templates') {
                <app-story-presets caption="Свои кнопки и название строки в обоих наборах">
                    <ng-template>
                        <div [style.width]="fieldWidth">
                            <rt-dynamic-selector
                                keyExp="id"
                                displayExp="name"
                                ariaLabel="Команда"
                                [entities]="people"
                                [formControl]="templatesControl">
                                <ng-template rtDynamicSelectorRowTitle let-person>
                                    <strong>{{ person.name }}</strong>
                                    · #{{ person.id }}
                                </ng-template>
                                <ng-template rtDynamicSelectorRowControls>
                                    <rt-icon-button icon="info" size="sm" ariaLabel="О сотруднике" />
                                </ng-template>
                            </rt-dynamic-selector>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('invitation') {
                <app-story-presets caption="Приглашение и «нечего выбрать» в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="invitationCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-invitationCase>
                                <rt-dynamic-selector
                                    keyExp="id"
                                    displayExp="name"
                                    invitationIcon="users"
                                    invitationDescription="В команде пока никого нет"
                                    [ariaLabel]="invitationCase.name"
                                    [entities]="invitationCase.entities"
                                    [invitation]="invitationCase.invitation"
                                    [formControl]="invitationCase.control" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-presets caption="Значение, форма и отключение в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="stateCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-stateCase>
                                <rt-dynamic-selector
                                    keyExp="id"
                                    displayExp="name"
                                    [ariaLabel]="stateCase.name"
                                    [entities]="people"
                                    [draggable]="stateCase.draggable"
                                    [readonlyKeys]="stateCase.readonlyKeys"
                                    [formControl]="stateCase.control" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('popup') {
                <app-story-presets caption="Окно выбора в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="popupCases" [itemLabel]="caseLabel" [slotWidth]="popupWidth">
                            <ng-template let-popupCase>
                                <rt-dynamic-selector-popup
                                    keyExp="id"
                                    displayExp="name"
                                    [entities]="popupCase.entities"
                                    [mode]="popupCase.mode"
                                    [multiToggleShown]="popupCase.multiToggleShown"
                                    [loading]="popupCase.loading"
                                    [pinnedKeys]="popupCase.pinnedKeys" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('input') {
                <app-story-presets caption="Поле строк в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="inputCases" [itemLabel]="caseLabel" [slotWidth]="fieldWidth">
                            <ng-template let-inputCase>
                                <rt-dynamic-input
                                    [ariaLabel]="inputCase.name"
                                    [editable]="inputCase.editable"
                                    [draggable]="inputCase.draggable"
                                    [readonlyKeys]="inputCase.readonlyKeys"
                                    [formControl]="inputCase.control" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Список и окно в обоих наборах">
                    <ng-template>
                        <div class="app-dynamic-selector-matrix__theme-cell">
                            <rt-dynamic-selector
                                keyExp="id"
                                displayExp="name"
                                ariaLabel="Команда"
                                draggable
                                [entities]="people"
                                [readonlyKeys]="themeReadonly"
                                [formControl]="presetsControl" />
                            <rt-dynamic-selector-popup keyExp="id" displayExp="name" [entities]="people" [pinnedKeys]="themePinned" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Список и окно в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div class="app-dynamic-selector-matrix__theme-cell">
                                    <rt-dynamic-selector
                                        keyExp="id"
                                        displayExp="name"
                                        ariaLabel="Команда"
                                        draggable
                                        [entities]="people"
                                        [readonlyKeys]="themeReadonly"
                                        [formControl]="themeControl" />
                                    <rt-dynamic-selector-popup
                                        keyExp="id"
                                        displayExp="name"
                                        [entities]="people"
                                        [pinnedKeys]="themePinned" />
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    styles: `
        .app-dynamic-selector-matrix__theme-cell {
            display: flex;
            width: 22rem;
            flex-direction: column;
            gap: 1rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtDynamicInputComponent,
        RtDynamicSelectorRowControlsDirective,
        RtDynamicSelectorRowTitleDirective,
        RtIconButtonComponent,
        RtDynamicSelectorComponent,
        RtDynamicSelectorPopupComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDynamicSelectorMatrixComponent {
    public part: TDynamicSelectorMatrixPart = 'rows';

    /** Ширина ячейки поля: строка с тремя кнопками и именем в две части помещается целиком. */
    public readonly fieldWidth: string = '22rem';
    /** Ширина окна выбора — его собственная, 20rem, как у первого кита. */
    public readonly popupWidth: string = '20rem';
    public readonly people: readonly IStoryPerson[] = STORY_PEOPLE;

    public readonly rowsCases: readonly IRowsCase[] = [
        { name: 'строки', draggable: false, readonlyKeys: [], control: chosen([1, 2, 3]) },
        { name: 'перетаскивание', draggable: true, readonlyKeys: [], control: chosen([1, 2, 3]) },
        { name: 'только для чтения', draggable: true, readonlyKeys: [1, 3], control: chosen([1, 2, 3]) },
        { name: 'пусто', draggable: false, readonlyKeys: [], control: chosen([]) },
    ];

    public readonly invitationCases: readonly {
        readonly name: string;
        readonly entities: readonly IStoryPerson[];
        readonly invitation: boolean;
        readonly control: FormControl<number[] | null>;
    }[] = [
        { name: 'приглашение', entities: STORY_PEOPLE, invitation: true, control: chosen([]) },
        { name: 'приглашение со строками', entities: STORY_PEOPLE, invitation: true, control: chosen([4]) },
        { name: 'нечего выбрать', entities: [], invitation: false, control: chosen([]) },
    ];

    public readonly stateCases: readonly IRowsCase[] = [
        { name: 'отключено', draggable: true, readonlyKeys: [], control: disabled([1, 2]) },
        { name: 'только чтение, всё закреплено', draggable: false, readonlyKeys: [1, 2], control: chosen([1, 2]) },
    ];

    public readonly popupCases: readonly IPopupCase[] = [
        { name: 'несколько', entities: STORY_PEOPLE.slice(0, 5), mode: 'multi', multiToggleShown: false, loading: false, pinnedKeys: [] },
        {
            name: 'переключатель «несколько»',
            entities: STORY_PEOPLE.slice(0, 5),
            mode: 'multi',
            multiToggleShown: true,
            loading: false,
            pinnedKeys: [],
        },
        {
            name: 'закреплённые',
            entities: STORY_PEOPLE.slice(0, 5),
            mode: 'multi',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [1, 2],
        },
        {
            name: 'одна запись',
            entities: STORY_PEOPLE.slice(0, 5),
            mode: 'single',
            multiToggleShown: false,
            loading: false,
            pinnedKeys: [],
        },
        { name: 'загрузка', entities: [], mode: 'multi', multiToggleShown: false, loading: true, pinnedKeys: [] },
        { name: 'ничего не найдено', entities: [], mode: 'multi', multiToggleShown: false, loading: false, pinnedKeys: [] },
    ];

    public readonly inputCases: readonly IInputCase[] = [
        {
            name: 'строки',
            editable: false,
            draggable: false,
            readonlyKeys: [],
            control: texts([NORTH, SOUTH]),
        },
        {
            name: 'правка',
            editable: true,
            draggable: false,
            readonlyKeys: [],
            control: texts([NORTH, SOUTH]),
        },
        {
            name: 'перетаскивание и закреплённая',
            editable: false,
            draggable: true,
            readonlyKeys: [NORTH],
            control: texts([NORTH, SOUTH]),
        },
    ];

    public readonly themeReadonly: readonly number[] = [1];
    public readonly themePinned: readonly number[] = [1];
    public readonly themeControl: FormControl<number[] | null> = chosen([1, 2]);
    public readonly presetsControl: FormControl<number[] | null> = chosen([1, 2]);
    public readonly templatesControl: FormControl<number[] | null> = chosen([4, 5]);

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
