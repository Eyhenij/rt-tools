import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtCopyValueComponent } from '../../rt-copy-value.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TCopyValueMatrixPart = 'label' | 'width' | 'presets' | 'themes';

/** Случай подписи: что передали и как подписать ячейку. */
interface ICopyValueCase {
    readonly name: string;
    readonly label: string;
    readonly value: string;
}

/**
 * Матрицы `rt-copy-value` для витрины. Ось ширины показывает длинное значение в узкой колонке:
 * оно обрезается многоточием, кнопка остаётся видна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-copy-value-matrix',
    templateUrl: './test-copy-value-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCopyValueComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtCopyValueMatrixComponent {
    public part: TCopyValueMatrixPart = 'label';

    public readonly labelCases: readonly ICopyValueCase[] = [
        { name: 'без подписи', label: '', value: '8f3c2a91-4d7e' },
        { name: 'с подписью', label: 'Reference', value: '8f3c2a91-4d7e' },
    ];

    public readonly caseLabel: (value: ICopyValueCase) => string = (value: ICopyValueCase): string => value.name;
}
