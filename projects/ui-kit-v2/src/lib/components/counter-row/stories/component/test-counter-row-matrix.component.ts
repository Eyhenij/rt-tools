import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { STORY_FIELD_WIDTH_WIDE } from '../../../../../showcase/story-metrics';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtCounterComponent } from '../../../counter/rt-counter.component';
import { RtToggleSwitchComponent } from '../../../toggle-switch/rt-toggle-switch.component';
import { RtCounterRowComponent } from '../../rt-counter-row.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type CounterRowMatrixPart = 'anatomy' | 'content' | 'list' | 'themes';

/** Случай анатомии: есть ли под подписью пояснение и насколько длинна подпись. */
interface ICounterRowCase {
    readonly name: string;
    readonly label: string;
    readonly hint: string;
    readonly control: FormControl<number>;
}

/** Строка списка: подпись, пояснение и своё значение счётчика. */
interface ICounterRowItem {
    readonly label: string;
    readonly hint: string;
    readonly min: number;
    readonly control: FormControl<number>;
}

function count(value: number): FormControl<number> {
    return new FormControl<number>(value, { nonNullable: true });
}

/**
 * Матрицы состояний `rt-counter-row` для витрины.
 *
 * Строка отвечает только за раскладку и не знает, что именно считают, поэтому её оси — не
 * значения входов, а то, что в неё положили и как она стоит среди соседей: волосяную линию
 * между строками видно только в списке, а не в одиночной ячейке.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-counter-row-matrix',
    template: `
        @switch (part) {
            @case ('anatomy') {
                <app-story-row caption="Анатомия" [items]="anatomyCases" [itemLabel]="caseLabel" [slotWidth]="rowWidth">
                    <ng-template let-anatomyCase>
                        <div class="app-counter-row-matrix__box">
                            <rt-counter-row [label]="anatomyCase.label" [hint]="anatomyCase.hint">
                                <rt-counter [ariaLabel]="anatomyCase.label" [formControl]="anatomyCase.control" />
                            </rt-counter-row>
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('content') {
                <app-story-row caption="Что кладут внутрь" [items]="contentNames" [slotWidth]="rowWidth">
                    <ng-template let-contentName>
                        <div class="app-counter-row-matrix__box">
                            @if (contentName === 'тумблер') {
                                <rt-counter-row label="Уведомления" hint="Письма о новых заявках">
                                    <rt-toggle-switch ariaLabel="Уведомления" [formControl]="notify" />
                                </rt-counter-row>
                            } @else {
                                <rt-counter-row label="Гостей" hint="Не больше четырёх">
                                    <rt-counter ariaLabel="Гостей" [min]="1" [max]="4" [formControl]="guests" />
                                </rt-counter-row>
                            }
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('list') {
                <app-story-row caption="Список подряд" [items]="listNames" [slotWidth]="rowWidth">
                    <ng-template>
                        <div class="app-counter-row-matrix__box">
                            @for (item of listItems; track item.label) {
                                <rt-counter-row [label]="item.label" [hint]="item.hint">
                                    <rt-counter [ariaLabel]="item.label" [min]="item.min" [formControl]="item.control" />
                                </rt-counter-row>
                            }
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Список в обеих темах">
                    <ng-template>
                        @for (item of listItems; track item.label) {
                            <rt-counter-row [label]="item.label" [hint]="item.hint">
                                <rt-counter [ariaLabel]="item.label" [min]="item.min" [formControl]="item.control" />
                            </rt-counter-row>
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    // Строка сама по себе шириной не обладает — она раздвигает подпись и контрол по краям
    // того, во что положена. В ячейке по содержимому раскладки «слева-справа» не увидеть,
    // поэтому демонстрационная коробка занимает ячейку целиком.
    styles: `
        .app-counter-row-matrix__box {
            inline-size: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtCounterComponent,
        RtCounterRowComponent,
        RtToggleSwitchComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtCounterRowMatrixComponent {
    public part: CounterRowMatrixPart = 'anatomy';

    public readonly rowWidth: string = STORY_FIELD_WIDTH_WIDE;
    public readonly contentNames: readonly string[] = ['счётчик', 'тумблер'];
    /** Список показывается одной ячейкой: волосяная линия принадлежит паре соседей, а не строке. */
    public readonly listNames: readonly string[] = ['три строки подряд'];

    public readonly notify: FormControl<boolean> = new FormControl<boolean>(true, { nonNullable: true });
    public readonly guests: FormControl<number> = count(2);

    public readonly anatomyCases: readonly ICounterRowCase[] = [
        { name: 'подпись', label: 'Гостей', hint: '', control: count(2) },
        { name: 'подпись и пояснение', label: 'Гостей', hint: 'Не больше четырёх', control: count(2) },
        { name: 'длинная подпись', label: 'Дополнительные спальные места', hint: 'Оплачиваются отдельно', control: count(1) },
    ];

    public readonly listItems: readonly ICounterRowItem[] = [
        { label: 'Взрослых', hint: 'От 14 лет', min: 1, control: count(2) },
        { label: 'Детей', hint: 'От 2 до 13 лет', min: 0, control: count(1) },
        { label: 'Младенцев', hint: 'До 2 лет', min: 0, control: count(0) },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: ICounterRowCase) => string = (value: ICounterRowCase): string => value.name;
}
