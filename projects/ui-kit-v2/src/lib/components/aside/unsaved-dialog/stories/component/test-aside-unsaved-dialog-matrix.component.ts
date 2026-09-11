import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { RtDialogRef } from '../../../../dialog/rt-dialog-ref';
import { RtAsideUnsavedDialogComponent } from '../../rt-aside-unsaved-dialog.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAsideUnsavedDialogMatrixPart = 'outcomes' | 'presets' | 'themes';

/**
 * Ручка окна для витрины: закрывать здесь нечего — окно нарисовано прямо на странице, а не
 * поднято наложением. Настоящая ручка сносит наложение, которого нет, поэтому подставлена
 * пустая: без неё компонент не поднимается вовсе — ручку он берёт из инжектора полем.
 */
function storyDialogRef(): RtDialogRef<never> {
    return new RtDialogRef<never>({ dispose: (): void => undefined } as OverlayRef);
}

/**
 * Матрицы `rt-aside-unsaved-dialog` для витрины.
 *
 * Окно открывает общая основа панели, наружу компонент не экспортируется, и до этой истории он
 * попадал в кадр только вместе с той панелью, которая его открыла. Своих входов у него нет: весь
 * текст берётся из набора подписей кита, а вид задают три кнопки исхода.
 *
 * Главное, что показывает матрица исходов, — какая кнопка какой ценой подана: отказ от правок
 * стоит красной рамкой, потому что после него введённое не вернуть, а сохранение — залитой
 * кнопкой. Порознь эти три кнопки читаются как равные.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-aside-unsaved-dialog-matrix',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        @switch (part) {
            @case ('outcomes') {
                <div class="app-aside-unsaved-dialog-matrix__single" data-story-root>
                    <h3 class="app-aside-unsaved-dialog-matrix__caption">Три исхода закрытия панели с правками</h3>
                    <rt-aside-unsaved-dialog />
                </div>
            }

            @case ('presets') {
                <app-story-presets caption="Окно несохранённых правок в обоих наборах оформления">
                    <ng-template>
                        <rt-aside-unsaved-dialog />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Окно несохранённых правок в обеих темах">
                    <ng-template>
                        <rt-aside-unsaved-dialog />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    // native-ok: обёртка истории витрины — правила ячейки живут рядом с показом, а не отдельным файлом
    styles: `
        .app-aside-unsaved-dialog-matrix__single {
            display: grid;
            gap: 0.75rem;
            padding: 1rem;
        }

        .app-aside-unsaved-dialog-matrix__caption {
            margin: 0;
            font-size: 0.875rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: RtDialogRef, useFactory: storyDialogRef }],
    imports: [
        // components
        RtAsideUnsavedDialogComponent,

        // showcase
        StoryPresetsComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAsideUnsavedDialogMatrixComponent {
    public part: TAsideUnsavedDialogMatrixPart = 'outcomes';
}
