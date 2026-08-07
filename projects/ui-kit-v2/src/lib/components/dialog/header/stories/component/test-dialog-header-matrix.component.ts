import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { RtDialogHeaderComponent } from '../../rt-dialog-header.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type DialogHeaderMatrixPart = 'closable' | 'title' | 'themes';

/** Крестик: он единственное, чем шапка отличается сама от себя. */
interface IDialogHeaderClosableCase {
    readonly name: string;
    readonly closable: boolean;
}

/** Длина заголовка: он занимает всю ширину и на длинной строке переносится. */
interface IDialogHeaderTitleCase {
    readonly name: string;
    readonly title: string;
}

/**
 * Матрицы состояний `rt-dialog-header` для витрины.
 *
 * Шапка показана без вмещающего окна: она самостоятельный компонент, и крестик ищет ссылку на
 * окно **необязательным** инжектом — вне диалога нажатие просто ничего не делает. Как она
 * выглядит внутри окна, показывает матрица `Dialog → Parts`.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-dialog-header-matrix',
    template: `
        @switch (part) {
            @case ('closable') {
                <app-story-row caption="Крестик" [items]="closableCases" [itemLabel]="caseLabel" [slotWidth]="headerWidth">
                    <ng-template let-closableCase>
                        <rt-dialog-header title="Удалить запись?" [closable]="closableCase.closable" />
                    </ng-template>
                </app-story-row>
            }

            @case ('title') {
                <app-story-row caption="Длина заголовка" [items]="titleCases" [itemLabel]="caseLabel" [slotWidth]="headerWidth">
                    <ng-template let-titleCase>
                        <rt-dialog-header [title]="titleCase.title" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Шапка в обеих темах">
                    <ng-template>
                        <rt-dialog-header title="Удалить запись?" />
                        <rt-dialog-header title="Без крестика" [closable]="false" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDialogHeaderComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDialogHeaderMatrixComponent {
    public part: DialogHeaderMatrixPart = 'closable';

    /** Ширина ячейки: шапка занимает всю ширину окна, и по содержимому она бы схлопнулась. */
    public readonly headerWidth: string = '18rem';

    public readonly closableCases: readonly IDialogHeaderClosableCase[] = [
        { name: 'с крестиком', closable: true },
        { name: 'без крестика', closable: false },
    ];

    public readonly titleCases: readonly IDialogHeaderTitleCase[] = [
        { name: 'короткий', title: 'Удаление' },
        { name: 'длинный', title: 'Удалить запись вместе с приложенными файлами и историей изменений?' },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
