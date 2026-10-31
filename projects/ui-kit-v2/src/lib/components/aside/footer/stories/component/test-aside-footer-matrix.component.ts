import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { RtButtonDirective } from '../../../../button/rt-button.directive';
import { RtAsideFooterComponent, TRtAsideFooterLayout } from '../../rt-aside-footer.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAsideFooterMatrixPart = 'zones' | 'layouts' | 'presets' | 'themes';

/** Набор зон футера: какие зоны в него спроецировали. */
interface IAsideFooterZoneCase {
    readonly name: string;
    readonly dismiss: boolean;
    readonly primary: boolean;
    readonly stray: boolean;
}

/**
 * Матрицы `rt-aside-footer` для витрины.
 *
 * Футер — слот композиции: вид его кнопок задают вход `layout` и то, что в него
 * спроецировали. Матрица перебирает наборы спроецированных зон и обе раскладки; подпись
 * `phoneCloseLabel` видна только на телефоне и показана историей панели подключения службы.
 *
 * Случай «содержимое без атрибута» стоит в ряду нарочно: футер принимает только две именованные
 * зоны, и кнопка без `asideDismiss` или `asidePrimary` не отрисуется вовсе. В кадре это видно
 * пустым футером рядом с заполненными.
 *
 * Ширина ячейки задана: футер занимает всю ширину панели, и по содержимому он бы схлопнулся,
 * показывая не раскладку, а её отсутствие.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-aside-footer-matrix',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        @switch (part) {
            @case ('zones') {
                <app-story-row caption="Зоны футера" [items]="zoneCases" [itemLabel]="caseLabel" [slotWidth]="footerWidth">
                    <ng-template let-zoneCase>
                        <rt-aside-footer class="app-aside-footer-matrix__footer">
                            @if (zoneCase.dismiss) {
                                <button rtButton asideDismiss appearance="text">Закрыть</button>
                            }
                            @if (zoneCase.primary) {
                                <button rtButton asidePrimary theme="primary">Сохранить</button>
                            }
                            @if (zoneCase.stray) {
                                <button rtButton>Без атрибута</button>
                            }
                        </rt-aside-footer>
                    </ng-template>
                </app-story-row>
            }

            @case ('layouts') {
                <app-story-row caption="Раскладки футера" [items]="layouts" [slotWidth]="layoutWidth">
                    <ng-template let-layout>
                        <rt-aside-footer class="app-aside-footer-matrix__footer" [layout]="layout">
                            <button rtButton asideDismiss label="Закрыть без сохранения"></button>
                            <button rtButton asidePrimary icon="check" label="Сохранить"></button>
                        </rt-aside-footer>
                    </ng-template>
                </app-story-row>
            }

            @case ('presets') {
                <app-story-presets caption="Футер в обоих наборах оформления">
                    <ng-template>
                        <rt-aside-footer class="app-aside-footer-matrix__footer">
                            <button rtButton asideDismiss appearance="text">Закрыть</button>
                            <button rtButton asidePrimary theme="primary">Сохранить</button>
                        </rt-aside-footer>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Футер в обеих темах">
                    <ng-template>
                        <rt-aside-footer class="app-aside-footer-matrix__footer">
                            <button rtButton asideDismiss appearance="text">Закрыть</button>
                            <button rtButton asidePrimary theme="primary">Сохранить</button>
                        </rt-aside-footer>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    // native-ok: обёртка истории витрины — правила ячейки живут рядом с показом, а не отдельным файлом
    styles: `
        /* Ячейка ряда центрирует содержимое, а раскладка футера — «по краям»: взятый по
           начинке, он прижал бы кнопки друг к другу и показал бы не раскладку, а её
           отсутствие. Ширина ячейки должна доставаться футеру. */
        .app-aside-footer-matrix__footer {
            width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAsideFooterComponent,
        RtButtonDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAsideFooterMatrixComponent {
    public part: TAsideFooterMatrixPart = 'zones';

    /** Ширина ячейки: футер занимает всю ширину панели и по содержимому схлопнулся бы. */
    public readonly footerWidth: string = '20rem';

    /** Ширина ячейки раскладок: обе кнопки с полной подписью занимают 373, и в 20rem не помещаются. */
    public readonly layoutWidth: string = '30rem';

    /** Обе раскладки: `between` — панель записи, `start` — панель подключения службы. */
    public readonly layouts: readonly TRtAsideFooterLayout[] = ['between', 'start'];

    public readonly zoneCases: readonly IAsideFooterZoneCase[] = [
        { name: 'только «Закрыть»', dismiss: true, primary: false, stray: false },
        { name: 'обе зоны', dismiss: true, primary: true, stray: false },
        { name: 'только позитивный глагол', dismiss: false, primary: true, stray: false },
        { name: 'содержимое без атрибута', dismiss: false, primary: false, stray: true },
    ];

    public readonly caseLabel: (value: IAsideFooterZoneCase) => string = (value: IAsideFooterZoneCase): string => value.name;
}
