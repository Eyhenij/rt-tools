import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtTagComponent } from '../../../tag/rt-tag.component';
import { RtInfoItemComponent } from '../../rt-info-item.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TInfoItemMatrixPart = 'loading' | 'grow' | 'content' | 'presets' | 'themes';

/**
 * Матрицы `rt-info-item` для витрины.
 *
 * Осей у пары «подпись: значение» две — загрузка и растяжение, и перемножать их незачем:
 * растяжение меняет ширину строки, загрузка — то, что стоит на месте значения. Зато нужен
 * ряд содержимого: значение приходит проекцией, и «что угодно внутри» — это и есть контракт.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-info-item-matrix',
    template: `
        @switch (part) {
            @case ('loading') {
                <app-story-presets caption="Загрузка в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="loadingStates" [itemLabel]="loadingLabel">
                            <ng-template let-loading>
                                <rt-info-item label="Тариф" [loading]="loading">Годовой</rt-info-item>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('grow') {
                <app-story-presets caption="Растяжение в обоих наборах">
                    <ng-template>
                        @for (grow of growStates; track grow) {
                            <div class="app-info-item-matrix__strip">
                                <span class="app-info-item-matrix__strip-label">{{ grow ? 'grow' : 'по содержимому' }}</span>
                                <rt-info-item label="Тариф" [grow]="grow">Годовой</rt-info-item>
                                <rt-info-item label="Статус" [grow]="grow">Активен</rt-info-item>
                                <rt-info-item label="Оплачен до" [grow]="grow">12.09.2026</rt-info-item>
                            </div>
                        }
                    </ng-template>
                </app-story-presets>

                <p class="app-info-item-matrix__note">
                    Строка одной ширины, а элементы в ней — с растяжением и без. Разница видна только в ряду: сам по себе элемент занимает
                    своё место в обоих случаях.
                </p>
            }

            @case ('content') {
                <app-story-presets caption="Что положено внутрь в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="contentCases">
                            <ng-template let-contentCase>
                                @switch (contentCase) {
                                    @case ('текст') {
                                        <rt-info-item label="Тариф">Годовой</rt-info-item>
                                    }
                                    @case ('пилюля') {
                                        <rt-info-item label="Статус">
                                            <rt-tag value="Активен" severity="success" />
                                        </rt-info-item>
                                    }
                                    @case ('пусто') {
                                        <rt-info-item label="Комментарий" />
                                    }
                                }
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Загрузка и значение в обоих наборах">
                    <ng-template>
                        @for (loading of loadingStates; track loading) {
                            <rt-info-item label="Тариф" [loading]="loading">Годовой</rt-info-item>
                        }
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Загрузка и значение в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                @for (loading of loadingStates; track loading) {
                                    <rt-info-item label="Тариф" [loading]="loading">Годовой</rt-info-item>
                                }
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    styles: `
        .app-info-item-matrix__note {
            max-width: 46rem;
            color: var(--rt-color-text-muted);
            font-size: 0.8125rem;
            line-height: 1.6;
        }

        .app-info-item-matrix__strip {
            display: flex;
            align-items: center;
            width: 100%;
            margin-block-end: 1rem;
            padding: 0.75rem;
            border: 1px dashed var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-md);
            gap: 1rem;
        }

        .app-info-item-matrix__strip-label {
            flex: 0 0 9rem;
            color: var(--rt-color-text-muted);
            font-family: var(--rt-font-family-mono);
            font-size: 0.6875rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtInfoItemComponent,
        RtTagComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtInfoItemMatrixComponent {
    public part: TInfoItemMatrixPart = 'loading';

    public readonly loadingStates: readonly boolean[] = [true, false];
    public readonly growStates: readonly boolean[] = [false, true];

    /** Значение приходит проекцией — ось не входа, а того, что внутрь положили. */
    public readonly contentCases: readonly string[] = ['текст', 'пилюля', 'пусто'];

    public readonly loadingLabel: (value: boolean) => string = (value: boolean): string => (value ? 'идёт' : 'закончилась');
}
