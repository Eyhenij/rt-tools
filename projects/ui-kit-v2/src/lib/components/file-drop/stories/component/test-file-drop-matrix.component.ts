import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtFileDropComponent } from '../../rt-file-drop.component';
import { IRtFileDrop } from '../../rt-file-drop.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type FileDropMatrixPart = 'resting' | 'dragging' | 'zones' | 'themes';

/** Область в покое: пока файл не тащат, видно только содержимое — и отключённость на нём не видна. */
interface IFileDropRestingCase {
    readonly name: string;
    readonly disabled: boolean;
}

/** Область под перетаскиванием: подпись подсказки и отключённость, которая её гасит. */
interface IFileDropDraggingCase {
    readonly name: string;
    readonly overlayLabel: string;
    readonly disabled: boolean;
}

/**
 * Матрицы состояний `rt-file-drop` для витрины.
 *
 * **Подсветку области рисует не вход, а признак, который компонент поднимает сам**, поймав
 * перетаскивание. Поэтому истории с подсветкой открывает `play`-функция: она посылает событие
 * перетаскивания с настоящим файлом внутри — так же, как это делает браузер.
 *
 * Областей подсвечено сколько угодно сразу: оверлея CDK здесь нет, и одна область о другой
 * ничего не знает.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-file-drop-matrix',
    template: `
        @switch (part) {
            @case ('resting') {
                <app-story-row caption="Область в покое" [items]="restingCases" [itemLabel]="caseLabel" [slotWidth]="areaWidth">
                    <ng-template let-restingCase>
                        <rt-file-drop class="app-file-drop-matrix__area" [disabled]="restingCase.disabled">
                            <div class="app-file-drop-matrix__content">Форма заявки</div>
                        </rt-file-drop>
                    </ng-template>
                </app-story-row>
            }

            @case ('dragging') {
                <app-story-row caption="Под перетаскиванием" [items]="draggingCases" [itemLabel]="caseLabel" [slotWidth]="areaWidth">
                    <ng-template let-draggingCase>
                        <rt-file-drop
                            class="app-file-drop-matrix__area"
                            [attr.data-story-trigger]="triggerAttribute"
                            [disabled]="draggingCase.disabled"
                            [overlayLabel]="draggingCase.overlayLabel">
                            <div class="app-file-drop-matrix__content">Форма заявки</div>
                        </rt-file-drop>
                    </ng-template>
                </app-story-row>
            }

            @case ('zones') {
                <app-story-row caption="Зоны под перетаскиванием" [items]="zoneCases" [itemLabel]="caseLabel" [slotWidth]="areaWidth">
                    <ng-template let-zoneCase>
                        <rt-file-drop
                            class="app-file-drop-matrix__area"
                            [attr.data-story-trigger]="triggerAttribute"
                            [zones]="zoneCase.zones">
                            <div class="app-file-drop-matrix__content app-file-drop-matrix__content--tall">Форма заявки</div>
                        </rt-file-drop>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Подсказка в обеих темах">
                    <ng-template>
                        <div class="app-file-drop-matrix__pane">
                            <rt-file-drop [attr.data-story-trigger]="triggerAttribute">
                                <div class="app-file-drop-matrix__content">Форма заявки</div>
                            </rt-file-drop>
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    styles: `
        /* Ячейка ряда центрирует содержимое, и область сжималась по своей начинке —
           98 px вместо заданных ячейке 224. Подписи зон в такой ширине не помещались
           и наезжали друг на друга: матрица показывала кашу вместо трёх полос. */
        .app-file-drop-matrix__area {
            width: 100%;
        }

        /* Содержимое области — демонстрационное: сама область его только оборачивает. */
        .app-file-drop-matrix__content {
            display: flex;
            height: 5rem;
            align-items: center;
            justify-content: center;
            border: 1px dashed var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-sm);
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-sm);
        }

        /* Зоны — стопка равных полос: на низкой области их не различить. */
        .app-file-drop-matrix__content--tall {
            height: 9rem;
        }

        .app-file-drop-matrix__pane {
            width: 14rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFileDropComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtFileDropMatrixComponent {
    public part: FileDropMatrixPart = 'resting';

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    /** Ширина ячейки: область тянется на всю ширину родителя и по содержимому схлопнулась бы. */
    public readonly areaWidth: string = '14rem';

    public readonly restingCases: readonly IFileDropRestingCase[] = [
        { name: 'обычная', disabled: false },
        { name: 'отключена', disabled: true },
    ];

    public readonly draggingCases: readonly IFileDropDraggingCase[] = [
        { name: 'подпись кита', overlayLabel: '', disabled: false },
        { name: 'своя подпись', overlayLabel: 'Отпустите, чтобы приложить', disabled: false },
        { name: 'отключена', overlayLabel: '', disabled: true },
    ];

    public readonly zoneCases: readonly { readonly name: string; readonly zones: readonly IRtFileDrop.Zone[] }[] = [
        {
            name: 'две зоны',
            zones: [
                { id: 'docs', label: 'Документы', sublabel: 'договоры и акты' },
                { id: 'photos', label: 'Фотографии' },
            ],
        },
        {
            name: 'три зоны',
            zones: [
                { id: 'docs', label: 'Документы' },
                { id: 'photos', label: 'Фотографии' },
                { id: 'other', label: 'Прочее' },
            ],
        },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
