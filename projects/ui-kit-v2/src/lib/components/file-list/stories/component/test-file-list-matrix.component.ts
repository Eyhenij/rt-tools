import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtFileCardComponent } from '../../../file-card/rt-file-card.component';
import { RtFileListComponent } from '../../rt-file-list.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TFileListMatrixPart = 'count' | 'cards' | 'edges' | 'themes';

/** Файл витрины: имя и вес — всё, что карточке нужно, чтобы выглядеть настоящей. */
interface IStoryFile {
    readonly name: string;
    readonly sizeBytes: number;
}

const FILES: readonly IStoryFile[] = [
    { name: 'Договор №2024-118.pdf', sizeBytes: 184320 },
    { name: 'Приложение №1.docx', sizeBytes: 20480 },
    { name: 'Акт сверки за март.xlsx', sizeBytes: 51200 },
    { name: 'Скан подписи.png', sizeBytes: 8192 },
];

/**
 * Матрицы состояний `rt-file-list` для витрины.
 *
 * Своих входов у списка нет вовсе: он раскладка вокруг карточек. Поэтому ось здесь одна — что
 * в него положили, — и матрицы показывают, как столбец ведёт себя от одной карточки до многих
 * и что делает с длинным именем.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-file-list-matrix',
    template: `
        @switch (part) {
            @case ('count') {
                <app-story-row caption="Сколько карточек в столбце" slotWidth="22rem" [items]="counts" [itemLabel]="countLabel">
                    <ng-template let-item>
                        <rt-file-list>
                            @for (file of item.files; track file.name) {
                                <rt-file-card [name]="file.name" [sizeBytes]="file.sizeBytes" />
                            }
                        </rt-file-list>
                    </ng-template>
                </app-story-row>
            }

            @case ('cards') {
                <app-story-row caption="Какие карточки внутри" slotWidth="22rem" [items]="cardCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-file-list>
                            <rt-file-card
                                [name]="files[0].name"
                                [sizeBytes]="files[0].sizeBytes"
                                [size]="item.size"
                                [showDownload]="item.actions"
                                [showRemove]="item.actions"
                                [disabled]="item.disabled" />
                            <rt-file-card
                                [name]="files[1].name"
                                [sizeBytes]="files[1].sizeBytes"
                                [size]="item.size"
                                [showDownload]="item.actions"
                                [showRemove]="item.actions"
                                [disabled]="item.disabled" />
                        </rt-file-list>
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="22rem" [items]="edgeCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-file-list>
                            @for (file of item.files; track file.name) {
                                <rt-file-card [name]="file.name" [sizeBytes]="file.sizeBytes" />
                            }
                        </rt-file-list>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Столбец файлов в обеих темах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-file-list>
                                @for (file of files; track file.name) {
                                    <rt-file-card showDownload showRemove [name]="file.name" [sizeBytes]="file.sizeBytes" />
                                }
                            </rt-file-list>
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFileListComponent,
        RtFileCardComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtFileListMatrixComponent {
    public part: TFileListMatrixPart = 'count';

    public readonly files: readonly IStoryFile[] = FILES;

    public readonly counts: readonly { name: string; files: readonly IStoryFile[] }[] = [
        { name: 'одна', files: FILES.slice(0, 1) },
        { name: 'две', files: FILES.slice(0, 2) },
        { name: 'четыре', files: FILES },
    ];

    /** Что бывает внутри столбца: размер карточек, кнопки действий, недоступность. */
    public readonly cardCases: readonly { name: string; size: 'sm' | 'md' | 'lg'; actions: boolean; disabled: boolean }[] = [
        { name: 'обычные', size: 'md', actions: false, disabled: false },
        { name: 'с действиями', size: 'md', actions: true, disabled: false },
        { name: 'мелкие', size: 'sm', actions: true, disabled: false },
        { name: 'недоступные', size: 'md', actions: true, disabled: true },
    ];

    public readonly edgeCases: readonly { name: string; files: readonly IStoryFile[] }[] = [
        {
            name: 'длинное имя',
            files: [{ name: 'Дополнительное соглашение номер четыре к договору от 14 марта 2024 года.pdf', sizeBytes: 1048576 }],
        },
        { name: 'без веса', files: [{ name: 'Черновик.txt', sizeBytes: 0 }] },
        { name: 'пустой столбец', files: [] },
    ];

    public readonly countLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;

    public readonly caseLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;
}
