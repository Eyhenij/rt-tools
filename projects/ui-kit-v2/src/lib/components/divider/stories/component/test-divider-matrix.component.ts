import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtIconComponent } from '../../../icon/rt-icon.component';
import { RtDividerComponent } from '../../rt-divider.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TDividerMatrixPart = 'orientation' | 'presets' | 'themes';

interface IGroupRow {
    readonly icon: 'user' | 'bell' | 'search';
    readonly label: string;
}

/**
 * Матрицы `rt-divider` для витрины.
 *
 * Перемножены направление и отступ: у горизонтальной линии отступ сдвигает её начало под текст
 * строки, у вертикальной — укорачивает её. Линия показана между соседями, а не одна: без них не
 * видно, что она разделяет и где начинается.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-divider-matrix',
    template: `
        <ng-template #horizontal let-inset>
            <div class="app-divider-matrix__list">
                @for (row of rows; track row.label; let last = $last) {
                    <div class="app-divider-matrix__item">
                        <span class="app-divider-matrix__icon"><rt-icon size="sm" [name]="row.icon" /></span>
                        <span>{{ row.label }}</span>
                    </div>
                    @if (!last) {
                        <rt-divider [inset]="inset" />
                    }
                }
            </div>
        </ng-template>

        <ng-template #vertical let-inset>
            <div class="app-divider-matrix__bar">
                <span>Номера</span>
                <rt-divider vertical [inset]="inset" />
                <span>Тарифы</span>
                <rt-divider vertical [inset]="inset" />
                <span>Услуги</span>
            </div>
        </ng-template>

        @switch (part) {
            @case ('orientation') {
                <app-story-presets caption="Направление × отступ в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="orientations" [columns]="insets" [columnLabel]="insetLabel">
                            <ng-template let-orientation let-inset="col">
                                <ng-container
                                    [ngTemplateOutlet]="orientation === 'vertical' ? vertical : horizontal"
                                    [ngTemplateOutletContext]="{ $implicit: inset }" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Разделитель в обоих наборах">
                    <ng-template>
                        <ng-container [ngTemplateOutlet]="horizontal" [ngTemplateOutletContext]="{ $implicit: false }" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Разделитель в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <ng-container [ngTemplateOutlet]="horizontal" [ngTemplateOutletContext]="{ $implicit: false }" />
                                <ng-container [ngTemplateOutlet]="vertical" [ngTemplateOutletContext]="{ $implicit: false }" />
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    // native-ok: раскладка соседей разделителя в витрине, в пакет не уезжает
    styles: `
        .app-divider-matrix__list {
            display: flex;
            width: 16rem;
            flex-direction: column;
        }

        .app-divider-matrix__item {
            display: flex;
            align-items: center;
            padding: var(--rt-space-2) var(--rt-space-4);
            font-size: var(--rt-text-sm);
            gap: var(--rt-space-4);
        }

        /* Отступ строки, значок и промежуток вместе — те же 64px, что и inset разделителя. */
        .app-divider-matrix__icon {
            display: flex;
            width: var(--rt-space-8);
        }

        .app-divider-matrix__bar {
            display: flex;
            height: var(--rt-control-height-md);
            align-items: stretch;
            font-size: var(--rt-text-sm);
            gap: var(--rt-space-4);
        }

        .app-divider-matrix__bar > span {
            display: flex;
            align-items: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,

        // components
        RtDividerComponent,
        RtIconComponent,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDividerMatrixComponent {
    public part: TDividerMatrixPart = 'orientation';

    public readonly orientations: readonly string[] = ['horizontal', 'vertical'];
    public readonly insets: readonly boolean[] = [false, true];

    public readonly rows: readonly IGroupRow[] = [
        { icon: 'user', label: 'Профиль' },
        { icon: 'bell', label: 'Уведомления' },
        { icon: 'search', label: 'Поиск' },
    ];

    public readonly insetLabel: (value: boolean) => string = (value: boolean): string => (value ? 'inset' : 'без отступа');
}
