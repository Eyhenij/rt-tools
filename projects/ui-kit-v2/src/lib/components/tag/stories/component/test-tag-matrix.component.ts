import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtIcon } from '../../../icon';
import { RtTagComponent } from '../../rt-tag.component';
import { IRtTag } from '../../rt-tag.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TagMatrixPart = 'severity' | 'shape' | 'radius' | 'icon' | 'closable' | 'themes';

/** Случай иконки — не значение оси, а различимая комбинация сторон. */
interface ITagIconCase {
    readonly name: string;
    readonly icon: IRtIcon.Name | null;
    readonly iconEnd: IRtIcon.Name | null;
}

/**
 * Матрицы `rt-tag` для витрины.
 *
 * Перемножена одна пара: палитра с внешним видом — у `outlined` цвет уходит в контур и
 * подпись, а не в заливку, и одной строкой это не показать. Форма, скругление и иконки от
 * палитры не зависят и идут рядами.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-tag-matrix',
    template: `
        @switch (part) {
            @case ('severity') {
                <app-story-grid caption="Палитра × внешний вид" [rows]="severities" [columns]="appearances">
                    <ng-template let-severity let-appearance="col">
                        <rt-tag [value]="severity" [severity]="severity" [appearance]="appearance" />
                    </ng-template>
                </app-story-grid>
            }

            @case ('shape') {
                <app-story-row caption="Форма" [items]="shapes">
                    <ng-template let-shape>
                        <rt-tag value="Активен" severity="success" [shape]="shape" />
                    </ng-template>
                </app-story-row>
            }

            @case ('radius') {
                <app-story-grid caption="Форма × скругление" [rows]="shapes" [columns]="radii" [columnLabel]="radiusLabel">
                    <ng-template let-shape let-radius="col">
                        <rt-tag value="Активен" severity="info" [shape]="shape" [radius]="radius" />
                    </ng-template>
                </app-story-grid>
            }

            @case ('icon') {
                <app-story-row caption="Иконки" [items]="iconCases" [itemLabel]="iconCaseLabel">
                    <ng-template let-iconCase>
                        <rt-tag value="Активен" severity="success" [icon]="iconCase.icon" [iconEnd]="iconCase.iconEnd" />
                    </ng-template>
                </app-story-row>
            }

            @case ('closable') {
                <app-story-grid caption="Крестик × палитра" [rows]="closables" [columns]="severities" [rowLabel]="closableLabel">
                    <ng-template let-closable let-severity="col">
                        <rt-tag [value]="severity" [severity]="severity" [closable]="closable" />
                    </ng-template>
                </app-story-grid>
            }

            @case ('themes') {
                <app-story-themes caption="Палитра в обеих темах">
                    <ng-template>
                        @for (severity of severities; track severity) {
                            <rt-tag [value]="severity" [severity]="severity" />
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTagComponent,

        // showcase
        StoryGridComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtTagMatrixComponent {
    public part: TagMatrixPart = 'severity';

    public readonly severities: readonly IRtTag.Severity[] = ['neutral', 'info', 'success', 'warning', 'danger', 'secondary'];
    public readonly appearances: readonly IRtTag.Appearance[] = ['solid', 'outlined'];
    public readonly shapes: readonly IRtTag.Shape[] = ['pill', 'square'];
    public readonly closables: readonly boolean[] = [false, true];

    /** `null` — не отсутствие значения, а «радиус по форме»: у него своя ячейка. */
    public readonly radii: readonly (IRtTag.Radius | null)[] = [null, 'none', 'sm', 'md', 'lg', 'full'];

    public readonly iconCases: readonly ITagIconCase[] = [
        { name: 'без иконок', icon: null, iconEnd: null },
        { name: 'слева', icon: 'check', iconEnd: null },
        { name: 'справа', icon: null, iconEnd: 'arrow-right' },
        { name: 'с обеих сторон', icon: 'check', iconEnd: 'arrow-right' },
    ];

    public readonly radiusLabel: (value: IRtTag.Radius | null) => string = (value: IRtTag.Radius | null): string =>
        value === null ? 'по форме' : value;

    public readonly closableLabel: (value: boolean) => string = (value: boolean): string => (value ? 'с крестиком' : 'без крестика');

    public readonly iconCaseLabel: (value: ITagIconCase) => string = (value: ITagIconCase): string => value.name;
}
