import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtIcon } from '../../../icon';
import { RT_RADIUS_STEPS, TRtRadius } from '../../../radius/rt-radius.model';
import { RtTagComponent } from '../../rt-tag.component';
import { IRtTag } from '../../rt-tag.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TTagMatrixPart =
    'severity' | 'size' | 'overflow' | 'radius' | 'icon' | 'closable' | 'handles' | 'host-rule' | 'presets' | 'themes';

/** Случай усечения — не значение оси, а пара «подпись и место, которое ей дали». */
interface ITagOverflowCase {
    readonly name: string;
    readonly value: string;
    readonly width: number;
}

/** Случай иконки — не значение оси, а различимая комбинация сторон. */
interface ITagIconCase {
    readonly name: string;
    readonly icon: IRtIcon.Name | null;
    readonly iconEnd: IRtIcon.Name | null;
}

/**
 * Случай свойств, которые приложение ставит на тег компонента. Инлайн-стиль — самое сильное
 * правило на теге: если свойство не дошло и от него, его не достанет и правило приложения.
 */
interface ITagStyleCase {
    readonly name: string;
    readonly appearance: IRtTag.Appearance;
    readonly style: Readonly<Record<string, string>>;
}

/** Ручки цвета, отступов и интервала — те, что приложение задаёт вместо палитры и ступени. */
const TAG_HANDLES: Readonly<Record<string, string>> = {
    '--rt-tag-color-bg': 'var(--rt-color-bg-surface)',
    '--rt-tag-color-text': 'var(--rt-color-text-primary)',
    '--rt-tag-color-border': 'var(--rt-color-border-strong)',
    '--rt-tag-padding-block': 'var(--rt-space-0-5)',
    '--rt-tag-padding-inline': 'var(--rt-space-4)',
    '--rt-tag-letter-spacing': '0.06em',
};

/**
 * Матрицы `rt-tag` для витрины.
 *
 * Перемножена одна пара: палитра с внешним видом — у `outlined` цвет уходит в контур и
 * подпись, а не в заливку, и одной строкой это не показать. Форма, скругление и иконки от
 * палитры не зависят и идут рядами.
 *
 * Ступень размера перемножена с иконкой: значок идёт ступенью пилюли, и порознь видно только
 * половину — что кегль сменился, а значок остался прежним, покажет одна эта пара.
 *
 * Усечение показано в ячейках заданной ширины: без места, которого подписи не хватает,
 * показывать нечего — метка взяла бы ширину по подписи и ничего не урезала.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-tag-matrix',
    template: `
        @switch (part) {
            @case ('severity') {
                <app-story-presets caption="Палитра × внешний вид в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="severities" [columns]="appearances">
                            <ng-template let-severity let-appearance="col">
                                <rt-tag [value]="severity" [severity]="severity" [appearance]="appearance" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('size') {
                <app-story-presets caption="Ступень × иконка в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="sizes" [columns]="iconCases" [columnLabel]="iconCaseLabel">
                            <ng-template let-size let-iconCase="col">
                                <rt-tag
                                    value="Активен"
                                    severity="success"
                                    [size]="size"
                                    [icon]="iconCase.icon"
                                    [iconEnd]="iconCase.iconEnd" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('overflow') {
                <app-story-presets caption="Подпись длиннее места в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="overflowCases" [itemLabel]="overflowCaseLabel">
                            <ng-template let-overflowCase>
                                <div [style.width.px]="overflowCase.width">
                                    <rt-tag severity="info" [value]="overflowCase.value" />
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('radius') {
                <app-story-presets caption="Шаги скругления в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="radii" [itemLabel]="radiusLabel">
                            <ng-template let-radius>
                                <rt-tag value="Активен" severity="info" [radius]="radius" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('icon') {
                <app-story-presets caption="Иконки в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="iconCases" [itemLabel]="iconCaseLabel">
                            <ng-template let-iconCase>
                                <rt-tag value="Активен" severity="success" [icon]="iconCase.icon" [iconEnd]="iconCase.iconEnd" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('closable') {
                <app-story-presets caption="Крестик × палитра в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="closables" [columns]="severities" [rowLabel]="closableLabel">
                            <ng-template let-closable let-severity="col">
                                <rt-tag [value]="severity" [severity]="severity" [closable]="closable" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('handles') {
                <app-story-presets caption="Палитра × ручки приложения в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="severities" [columns]="handleCases" [columnLabel]="styleCaseLabel">
                            <ng-template let-severity let-styleCase="col">
                                <rt-tag
                                    [value]="severity"
                                    [severity]="severity"
                                    [appearance]="styleCase.appearance"
                                    [style]="styleCase.style" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('host-rule') {
                <app-story-presets caption="Скругление и рамка с тега компонента в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="sizes" [columns]="hostRuleCases" [columnLabel]="styleCaseLabel">
                            <ng-template let-size let-styleCase="col">
                                <rt-tag
                                    value="Активен"
                                    severity="info"
                                    [size]="size"
                                    [appearance]="styleCase.appearance"
                                    [style]="styleCase.style" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Палитра в обоих наборах">
                    <ng-template>
                        @for (severity of severities; track severity) {
                            <rt-tag [value]="severity" [severity]="severity" />
                        }
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Палитра в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                @for (severity of severities; track severity) {
                                    <rt-tag [value]="severity" [severity]="severity" />
                                }
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTagComponent,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtTagMatrixComponent {
    public part: TTagMatrixPart = 'severity';

    public readonly severities: readonly IRtTag.Severity[] = ['neutral', 'info', 'success', 'warning', 'danger', 'secondary'];
    public readonly appearances: readonly IRtTag.Appearance[] = ['solid', 'outlined'];
    public readonly closables: readonly boolean[] = [false, true];
    public readonly sizes: readonly IRtTag.Size[] = ['sm', 'md', 'lg'];

    /**
     * Случаи усечения. Ширина стоит на ячейке вокруг метки, а не на самой метке: место даёт
     * метке тот, кто её ставит, и показать надо именно это.
     */
    public readonly overflowCases: readonly ITagOverflowCase[] = [
        { name: 'подпись влезает', value: 'Активен', width: 160 },
        { name: 'подписи не хватило места', value: 'Ожидает подтверждения оплаты', width: 160 },
        { name: 'места совсем мало', value: 'Ожидает подтверждения оплаты', width: 80 },
    ];

    /** `null` — не отсутствие значения, а умолчание метки: у него своя ячейка. */
    public readonly radii: readonly (TRtRadius | null)[] = [null, ...RT_RADIUS_STEPS];

    public readonly iconCases: readonly ITagIconCase[] = [
        { name: 'без иконок', icon: null, iconEnd: null },
        { name: 'слева', icon: 'check', iconEnd: null },
        { name: 'справа', icon: null, iconEnd: 'arrow-right' },
        { name: 'с обеих сторон', icon: 'check', iconEnd: 'arrow-right' },
    ];

    /** Каждая ручка перебивает палитру: одна и та же строка случаев на всех значимостях. */
    public readonly handleCases: readonly ITagStyleCase[] = [
        { name: 'кит', appearance: 'solid', style: {} },
        { name: 'ручки приложения', appearance: 'solid', style: TAG_HANDLES },
        { name: 'контур, кит', appearance: 'outlined', style: {} },
        { name: 'контур, ручки приложения', appearance: 'outlined', style: TAG_HANDLES },
    ];

    /** Свойства на теге компонента перебивают и ступень размера: строка — ступень, столбец — правило. */
    public readonly hostRuleCases: readonly ITagStyleCase[] = [
        { name: 'кит', appearance: 'outlined', style: {} },
        {
            name: 'правило на теге',
            appearance: 'outlined',
            style: { '--rt-tag-radius': 'var(--rt-radius-xs)', '--rt-tag-border-width': 'var(--rt-border-width-medium)' },
        },
    ];

    public readonly styleCaseLabel: (value: ITagStyleCase) => string = (value: ITagStyleCase): string => value.name;

    public readonly radiusLabel: (value: TRtRadius | null) => string = (value: TRtRadius | null): string => value ?? 'по умолчанию';

    public readonly closableLabel: (value: boolean) => string = (value: boolean): string => (value ? 'с крестиком' : 'без крестика');

    public readonly iconCaseLabel: (value: ITagIconCase) => string = (value: ITagIconCase): string => value.name;

    public readonly overflowCaseLabel: (value: ITagOverflowCase) => string = (value: ITagOverflowCase): string => value.name;
}
