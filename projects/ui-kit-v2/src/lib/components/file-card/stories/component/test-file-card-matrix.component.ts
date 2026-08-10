import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtFileCardComponent } from '../../rt-file-card.component';
import { IRtFileCard } from '../../rt-file-card.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type FileCardMatrixPart = 'size' | 'actions' | 'name' | 'weight' | 'states' | 'disabled' | 'themes';

/** Случай имени файла: имя для подписи ячейки, само имя и вес. */
interface IFileNameCase {
    readonly name: string;
    readonly fileName: string;
    readonly sizeBytes: number | null;
}

/**
 * Матрицы состояний `rt-file-card` для витрины.
 *
 * **Иконка и заголовок выводятся из имени файла**: расширение выбирает иконку, а заголовок —
 * это имя без расширения. Отдельных входов у них нет, поэтому ось имени показана случаями
 * расширений, а не перечислением значений.
 *
 * Размер перемножен с набором действий: у мелкой карточки кнопки теснятся, и расхождение видно
 * только на этой паре.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-file-card-matrix',
    template: `
        @switch (part) {
            @case ('size') {
                <app-story-grid caption="Размер × набор действий" slotWidth="17rem" [rows]="sizes" [columns]="actionSets">
                    <ng-template let-size let-actions="col">
                        <rt-file-card
                            name="договор-2024-118.pdf"
                            [sizeBytes]="248000"
                            [size]="size"
                            [showDownload]="actions !== 'без кнопок'"
                            [showRemove]="actions === 'все три'"
                            [showRename]="actions === 'все три'" />
                    </ng-template>
                </app-story-grid>
            }

            @case ('actions') {
                <app-story-row caption="Кнопки по отдельности" slotWidth="17rem" [items]="actionCases">
                    <ng-template let-action>
                        <rt-file-card
                            name="договор-2024-118.pdf"
                            [sizeBytes]="248000"
                            [showDownload]="action === 'скачать'"
                            [showRemove]="action === 'удалить'"
                            [showRename]="action === 'переименовать'" />
                    </ng-template>
                </app-story-row>
            }

            @case ('name') {
                <app-story-row caption="Имя файла решает иконку и заголовок" slotWidth="17rem" [items]="names" [itemLabel]="nameLabel">
                    <ng-template let-item>
                        <rt-file-card showDownload [name]="item.fileName" [sizeBytes]="item.sizeBytes" />
                    </ng-template>
                </app-story-row>
            }

            @case ('weight') {
                <app-story-row caption="Вес файла" slotWidth="17rem" [items]="weights" [itemLabel]="weightLabel">
                    <ng-template let-value>
                        <rt-file-card showDownload name="выгрузка.csv" [sizeBytes]="value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" slotWidth="17rem" [items]="states" [itemLabel]="stateLabel">
                    <ng-template let-state>
                        <rt-file-card
                            showDownload
                            showRemove
                            name="договор-2024-118.pdf"
                            [sizeBytes]="248000"
                            [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>
            }

            @case ('disabled') {
                <app-story-row caption="Отключение" slotWidth="17rem" [items]="disabledCases" [itemLabel]="disabledLabel">
                    <ng-template let-value>
                        <rt-file-card
                            showDownload
                            showRemove
                            showRename
                            name="договор-2024-118.pdf"
                            [sizeBytes]="248000"
                            [disabled]="value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Карточка в обеих темах">
                    <ng-template>
                        <div style="width: 17rem">
                            <rt-file-card showDownload showRemove name="договор-2024-118.pdf" [sizeBytes]="248000" />
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFileCardComponent,

        // showcase
        StoryGridComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtFileCardMatrixComponent {
    public part: FileCardMatrixPart = 'size';

    public readonly sizes: readonly IRtFileCard.Size[] = ['sm', 'md', 'lg'];
    public readonly actionSets: readonly string[] = ['без кнопок', 'только скачать', 'все три'];
    public readonly actionCases: readonly string[] = ['скачать', 'удалить', 'переименовать'];
    public readonly disabledCases: readonly boolean[] = [false, true];

    public readonly states: readonly IStoryState[] = STORY_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** Расширение выбирает иконку, незнакомое даёт общую; длинное имя обрезается в середине. */
    public readonly names: readonly IFileNameCase[] = [
        { name: 'pdf', fileName: 'договор-2024-118.pdf', sizeBytes: 248000 },
        { name: 'таблица', fileName: 'выгрузка_за_март.xlsx', sizeBytes: 92000 },
        { name: 'картинка', fileName: 'схема-подключения.png', sizeBytes: 1450000 },
        { name: 'незнакомое расширение', fileName: 'дамп.qwerty', sizeBytes: 4096 },
        { name: 'без расширения', fileName: 'README', sizeBytes: 800 },
        { name: 'длинное имя', fileName: 'дополнительное-соглашение-номер-четыре-к-договору.pdf', sizeBytes: 310000 },
    ];

    /** Вес показан краями: нулевой, килобайты, мегабайты и неизвестный. */
    public readonly weights: readonly (number | null)[] = [0, 2048, 5_400_000, null];

    public readonly nameLabel: (value: IFileNameCase) => string = (value: IFileNameCase): string => value.name;

    public readonly weightLabel: (value: number | null) => string = (value: number | null): string =>
        value === null ? 'вес неизвестен' : value === 0 ? 'нулевой' : value < 1_000_000 ? 'килобайты' : 'мегабайты';

    public readonly disabledLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'disabled — кнопки не нажимаются' : 'обычная';
}
