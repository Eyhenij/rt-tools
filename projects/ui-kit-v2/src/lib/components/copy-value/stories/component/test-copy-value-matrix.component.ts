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
    template: `
        @switch (part) {
            @case ('label') {
                <app-story-presets caption="Подпись в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="labelCases" [itemLabel]="caseLabel">
                            <ng-template let-c>
                                <rt-copy-value [label]="c.label" [value]="c.value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('width') {
                <app-story-presets caption="Длинное значение в колонке 240px">
                    <ng-template>
                        <div style="inline-size: 240px">
                            <rt-copy-value label="Reference" value="8f3c2a91-4d7e-4b5a-9f21-0c6e3d7a1b44" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Значение с подписью в обоих наборах">
                    <ng-template>
                        <rt-copy-value label="Reference" value="8f3c2a91-4d7e" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Значение в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <rt-copy-value label="Reference" value="8f3c2a91-4d7e" />
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
