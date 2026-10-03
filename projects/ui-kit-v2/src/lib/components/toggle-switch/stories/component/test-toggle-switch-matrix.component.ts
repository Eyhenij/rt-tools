import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_CONTROL_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { IRtToggleSwitch } from '../../rt-toggle-switch.model';
import { RtToggleSwitchComponent } from '../../rt-toggle-switch.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TToggleSwitchMatrixPart = 'size' | 'value' | 'icons' | 'label' | 'host-rule' | 'states' | 'presets' | 'themes';

/** Положение тумблера: выключено или включено. */
interface IToggleValueCase {
    readonly name: string;
    readonly control: FormControl<boolean>;
}

/** Набор иконок на треке: их видно только вместе с положением — бегунок закрывает одну из них. */
interface IToggleIconCase {
    readonly name: string;
    readonly iconOff: IRtIcon.Name | null;
    readonly iconOn: IRtIcon.Name | null;
}

/**
 * Свойства, которые приложение ставит на тег компонента. Инлайн-стиль — самое сильное правило
 * на теге: если свойство не дошло и от него, его не достанет и правило приложения.
 */
interface IToggleStyleCase {
    readonly name: string;
    readonly style: Readonly<Record<string, string>>;
}

function on(value: boolean): FormControl<boolean> {
    return new FormControl<boolean>(value, { nonNullable: true });
}

/**
 * Матрицы состояний `rt-toggle-switch` для витрины.
 *
 * Иконки перемножены с положением: бегунок непрозрачен и наезжает на иконку текущего состояния,
 * так что в каждом положении видна ровно одна из двух — по одному положению набор не прочитать.
 * Размер ни с чем не перемножается: он меняет трек и бегунок целиком, одинаково в обоих
 * положениях.
 *
 * Значение приходит только формой: своего входа значения у контрола нет.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-toggle-switch-matrix',
    template: `
        @switch (part) {
            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes">
                    <ng-template let-size>
                        <rt-toggle-switch ariaLabel="Размер" [size]="size" [formControl]="sizeValue" />
                    </ng-template>
                </app-story-row>
            }

            @case ('value') {
                <app-story-row caption="Положение" [items]="valueCases" [itemLabel]="caseLabel">
                    <ng-template let-valueCase>
                        <rt-toggle-switch [ariaLabel]="valueCase.name" [formControl]="valueCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('icons') {
                <app-story-grid
                    caption="Иконки × положение"
                    [rows]="iconCases"
                    [columns]="valueCases"
                    [rowLabel]="caseLabel"
                    [columnLabel]="caseLabel">
                    <ng-template let-iconCase let-valueCase="col">
                        <rt-toggle-switch
                            size="md"
                            [ariaLabel]="iconCase.name"
                            [iconOff]="iconCase.iconOff"
                            [iconOn]="iconCase.iconOn"
                            [formControl]="valueCase.control" />
                    </ng-template>
                </app-story-grid>
            }

            @case ('label') {
                <app-story-presets caption="Подпись × положение × отключённость в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="valueCases" [columns]="switches" [rowLabel]="caseLabel" [columnLabel]="switchLabel">
                            <ng-template let-valueCase let-off="col">
                                <rt-toggle-switch label="Уведомления" [disabled]="off" [formControl]="valueCase.control" />
                            </ng-template>
                        </app-story-grid>

                        <app-story-row caption="Свойства подписи с тега компонента" [items]="labelCases" [itemLabel]="caseLabel">
                            <ng-template let-styleCase>
                                <rt-toggle-switch
                                    label="Уведомления"
                                    [disabled]="true"
                                    [formControl]="disabledValue"
                                    [style]="styleCase.style" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('host-rule') {
                <app-story-grid caption="Размер × правило на теге" [rows]="sizes" [columns]="hostRuleCases" [columnLabel]="caseLabel">
                    <ng-template let-size let-styleCase="col">
                        <rt-toggle-switch ariaLabel="Размер" [size]="size" [formControl]="sizeValue" [style]="styleCase.style" />
                    </ng-template>
                </app-story-grid>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" [items]="states" [itemLabel]="stateLabel">
                    <ng-template let-state>
                        <rt-toggle-switch ariaLabel="Состояние" [attr.data-story-state]="state.state" [formControl]="stateValue" />
                    </ng-template>
                </app-story-row>

                <app-story-grid
                    caption="Положение × отключённость"
                    [rows]="valueCases"
                    [columns]="switches"
                    [rowLabel]="caseLabel"
                    [columnLabel]="switchLabel">
                    <ng-template let-valueCase let-off="col">
                        <rt-toggle-switch [ariaLabel]="valueCase.name" [disabled]="off" [formControl]="valueCase.control" />
                    </ng-template>
                </app-story-grid>
            }

            @case ('presets') {
                <app-story-presets caption="Тумблер в обоих наборах">
                    <ng-template>
                        @for (valueCase of valueCases; track valueCase.name) {
                            <rt-toggle-switch
                                size="md"
                                iconOff="ico-notificationOff"
                                iconOn="ico-notification"
                                [ariaLabel]="valueCase.name"
                                [formControl]="valueCase.control" />
                        }
                        <rt-toggle-switch ariaLabel="отключён" size="md" [disabled]="true" [formControl]="disabledValue" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Тумблер в обеих темах">
                    <ng-template>
                        @for (valueCase of valueCases; track valueCase.name) {
                            <rt-toggle-switch
                                size="md"
                                iconOff="ico-notificationOff"
                                iconOn="ico-notification"
                                [ariaLabel]="valueCase.name"
                                [formControl]="valueCase.control" />
                        }
                        <rt-toggle-switch ariaLabel="отключён" size="md" [disabled]="true" [formControl]="disabledValue" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtToggleSwitchComponent,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtToggleSwitchMatrixComponent {
    public part: TToggleSwitchMatrixPart = 'size';

    public readonly sizes: readonly IRtToggleSwitch.Size[] = ['sm', 'md', 'lg'];
    public readonly states: readonly IStoryState[] = STORY_CONTROL_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** Столбцы сетки отключённости: включённый контрол и он же отключённый. */
    public readonly switches: readonly boolean[] = [false, true];

    public readonly sizeValue: FormControl<boolean> = on(true);
    public readonly stateValue: FormControl<boolean> = on(true);
    public readonly disabledValue: FormControl<boolean> = on(true);

    public readonly valueCases: readonly IToggleValueCase[] = [
        { name: 'выключено', control: on(false) },
        { name: 'включено', control: on(true) },
    ];

    public readonly iconCases: readonly IToggleIconCase[] = [
        { name: 'без иконок', iconOff: null, iconOn: null },
        { name: 'обе иконки', iconOff: 'ico-notificationOff', iconOn: 'ico-notification' },
        { name: 'только включённая', iconOff: null, iconOn: 'check' },
    ];

    /** Отключённый с подписью: прозрачность и цвета подписи приходят свойствами с тега. */
    public readonly labelCases: readonly IToggleStyleCase[] = [
        { name: 'кит', style: {} },
        {
            name: 'прозрачность 0.3, подпись крупнее',
            style: {
                '--rt-toggle-disabled-opacity': '0.3',
                '--rt-toggle-label-size': 'var(--rt-text-md)',
                '--rt-toggle-label-color-on': 'var(--rt-color-action-primary)',
                '--rt-toggle-label-gap': 'var(--rt-space-4)',
            },
        },
    ];

    /** Свойства размеров на теге перебивают и ступень: у всех строк один и тот же трек. */
    public readonly hostRuleCases: readonly IToggleStyleCase[] = [
        { name: 'кит', style: {} },
        {
            name: 'правило на теге',
            style: {
                '--rt-toggle-track-width': '36px',
                '--rt-toggle-track-height': '20px',
                '--rt-toggle-thumb-size': '14px',
                '--rt-toggle-thumb-inset': '3px',
                '--rt-toggle-thumb-travel': '16px',
            },
        },
    ];

    /** Подпись столбца сетки отключённости. */
    public readonly switchLabel: (value: boolean) => string = (value: boolean): string => (value ? 'отключён' : 'включён');

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
