import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtButtonDirective } from '../../rt-button.directive';
import { IButton } from '../../rt-button.model';

/**
 * Матрицы состояний `[rtButton]` для витрины.
 *
 * Перемножены только оси, которые влияют друг на друга: палитра с внешним видом (у `text`
 * и `outlined` цвет уходит в подпись и контур, а не в заливку) и палитра с отключённостью.
 * Размер, скругление и позиция иконки от палитры не зависят — они идут рядами.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-button-matrix',
    template: `
        <app-story-grid caption="Палитра × внешний вид" [rows]="themes" [columns]="appearances">
            <ng-template let-theme let-appearance="col">
                <button rtButton [attr.aria-label]="theme" [label]="theme" [theme]="theme" [appearance]="appearance"></button>
            </ng-template>
        </app-story-grid>

        <app-story-grid caption="Палитра × отключённость" [rows]="themes" [columns]="appearances">
            <ng-template let-theme let-appearance="col">
                <button rtButton disabled [attr.aria-label]="theme" [label]="theme" [theme]="theme" [appearance]="appearance"></button>
            </ng-template>
        </app-story-grid>

        <app-story-grid caption="Размер × внешний вид" [rows]="sizes" [columns]="appearances">
            <ng-template let-size let-appearance="col">
                <button rtButton label="Сохранить" aria-label="Сохранить" [size]="size" [appearance]="appearance"></button>
            </ng-template>
        </app-story-grid>

        <app-story-row caption="Загрузка" [items]="appearances">
            <ng-template let-appearance>
                <button rtButton loading label="Сохранение…" aria-label="Сохранение" [appearance]="appearance"></button>
            </ng-template>
        </app-story-row>

        <app-story-row caption="Скругление" [items]="rounded" [itemLabel]="roundedLabel">
            <ng-template let-value>
                <button rtButton label="Сохранить" aria-label="Сохранить" [rounded]="value"></button>
            </ng-template>
        </app-story-row>

        <app-story-row caption="Иконка" [items]="iconCases" [itemLabel]="iconCaseLabel">
            <ng-template let-iconCase>
                <button
                    rtButton
                    [attr.aria-label]="iconCase.name"
                    [label]="iconCase.label"
                    [icon]="iconCase.icon"
                    [iconPos]="iconCase.iconPos"></button>
            </ng-template>
        </app-story-row>

        <app-story-themes caption="Палитра в обеих темах">
            <ng-template>
                @for (theme of themes; track theme) {
                    <button rtButton [attr.aria-label]="theme" [label]="theme" [theme]="theme"></button>
                }
            </ng-template>
        </app-story-themes>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // directives
        RtButtonDirective,

        // showcase
        StoryGridComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtButtonMatrixComponent {
    public readonly themes: readonly IButton.Theme[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];
    public readonly appearances: readonly IButton.Appearance[] = ['filled', 'outlined', 'text'];
    public readonly sizes: readonly IButton.Size[] = ['sm', 'md', 'lg'];
    public readonly rounded: readonly boolean[] = [false, true];

    /** Иконка — не ось значений, а три различимых случая: без неё, слева, справа, без подписи. */
    public readonly iconCases: readonly { name: string; label: string | null; icon: string | null; iconPos: IButton.IconPos }[] = [
        { name: 'без иконки', label: 'Сохранить', icon: null, iconPos: 'left' },
        { name: 'слева', label: 'Скачать', icon: 'ico-download', iconPos: 'left' },
        { name: 'справа', label: 'Далее', icon: 'ico-arrow-right', iconPos: 'right' },
        { name: 'без подписи', label: null, icon: 'ico-pencil', iconPos: 'left' },
    ];

    public readonly roundedLabel: (value: boolean) => string = (value: boolean): string => (value ? 'rounded' : 'по умолчанию');

    public readonly iconCaseLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;
}
