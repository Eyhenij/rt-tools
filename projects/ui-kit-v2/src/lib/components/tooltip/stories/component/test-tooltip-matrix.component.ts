import { AfterViewInit, ChangeDetectionStrategy, Component, Signal, viewChildren } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtTooltipComponent } from '../../rt-tooltip.component';
import { RtTooltipDirective } from '../../rt-tooltip.directive';
import { IRtTooltip } from '../../rt-tooltip.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TooltipMatrixPart = 'placement' | 'text' | 'hosts' | 'themes';

/** Сторона вместе с подписью: значение оси — строка, а подпись должна называть её по-русски. */
interface ITooltipPlacementCase {
    readonly name: string;
    readonly placement: IRtTooltip.Placement;
}

/** Длина текста: панель шириной до 240 px, и на длинной строке она переносит текст. */
interface ITooltipTextCase {
    readonly name: string;
    readonly text: string;
}

/**
 * Матрицы состояний `[rtTooltip]` для витрины.
 *
 * **Подсказки открываются все сразу.** Её оверлей не слушает ни указателя снаружи, ни
 * backdrop'а — в отличие от списка и меню, где открытая панель в истории ровно одна. Открывает
 * их `play`-функция наведением: щелчок подсказку как раз прячет, чтобы не закрывать результат
 * нажатия.
 *
 * Ряды оставляют под панель запас: она встаёт над триггером или под ним и без запаса налезала
 * бы на соседний ряд.
 *
 * Светло-тёмная пара показывает не директиву, а саму панель `rt-tooltip`: оверлей уезжает в
 * контейнер CDK, за пределы блока, которому пара назначает свойства темы. Текст панели
 * выставляется не входом, а сигналом — компонент создаётся директивой вручную, и входа у него
 * нет вовсе; здесь он проставляется через запрос по вью.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-tooltip-matrix',
    template: `
        @switch (part) {
            @case ('placement') {
                <div class="app-tooltip-matrix__room">
                    <app-story-row caption="Сторона" [items]="placementCases" [itemLabel]="caseLabel">
                        <ng-template let-placementCase>
                            <button
                                rtButton
                                type="button"
                                theme="secondary"
                                [label]="placementCase.name"
                                [attr.aria-label]="placementCase.name"
                                [attr.data-story-trigger]="triggerAttribute"
                                [rtTooltip]="'Подсказка ' + placementCase.name"
                                [rtTooltipPlacement]="placementCase.placement"></button>
                        </ng-template>
                    </app-story-row>
                </div>
            }

            @case ('text') {
                <div class="app-tooltip-matrix__room">
                    <app-story-row caption="Длина текста" [items]="textCases" [itemLabel]="caseLabel">
                        <ng-template let-textCase>
                            <button
                                rtButton
                                type="button"
                                theme="secondary"
                                rtTooltipPlacement="bottom"
                                [label]="textCase.name"
                                [attr.aria-label]="textCase.name"
                                [attr.data-story-trigger]="triggerAttribute"
                                [rtTooltip]="textCase.text"></button>
                        </ng-template>
                    </app-story-row>
                </div>
            }

            @case ('hosts') {
                <div class="app-tooltip-matrix__room">
                    <app-story-row caption="На чём висит" [items]="hostCases">
                        <ng-template let-hostCase>
                            @switch (hostCase) {
                                @case ('кнопка') {
                                    <button
                                        rtButton
                                        type="button"
                                        label="Кнопка"
                                        aria-label="Кнопка"
                                        rtTooltip="Подсказка на кнопке"
                                        rtTooltipPlacement="bottom"
                                        [attr.data-story-trigger]="triggerAttribute"></button>
                                }
                                @case ('иконочная кнопка') {
                                    <rt-icon-button
                                        icon="ico-trash"
                                        ariaLabel="Удалить"
                                        tooltip="Удалить строку"
                                        [attr.data-story-trigger]="triggerAttribute" />
                                }
                                @case ('пустой текст') {
                                    <button
                                        rtButton
                                        type="button"
                                        theme="secondary"
                                        label="Без подсказки"
                                        aria-label="Без подсказки"
                                        rtTooltip=""
                                        [attr.data-story-trigger]="triggerAttribute"></button>
                                }
                            }
                        </ng-template>
                    </app-story-row>
                </div>
            }

            @case ('themes') {
                <app-story-themes caption="Панель подсказки в обеих темах">
                    <ng-template>
                        <rt-tooltip />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    styles: `
        /* Панель встаёт над триггером или под ним: без запаса она налезала бы на соседний ряд
           и на подпись значения оси. */
        .app-tooltip-matrix__room {
            padding: 4rem 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtButtonDirective,
        RtIconButtonComponent,
        RtTooltipComponent,
        RtTooltipDirective,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtTooltipMatrixComponent implements AfterViewInit {
    /** Панели светло-тёмной пары: текст им ставится сигналом, входа у панели нет. */
    protected readonly panels: Signal<readonly RtTooltipComponent[]> = viewChildren(RtTooltipComponent);

    public part: TooltipMatrixPart = 'placement';

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public readonly placementCases: readonly ITooltipPlacementCase[] = [
        { name: 'сверху', placement: 'top' },
        { name: 'снизу', placement: 'bottom' },
    ];

    public readonly textCases: readonly ITooltipTextCase[] = [
        { name: 'короткий', text: 'Удалить' },
        {
            name: 'длинный',
            text: 'Строка будет удалена без возможности восстановления — сначала выгрузите отчёт',
        },
    ];

    public readonly hostCases: readonly string[] = ['кнопка', 'иконочная кнопка', 'пустой текст'];

    public ngAfterViewInit(): void {
        for (const panel of this.panels()) {
            panel.text.set('Удалить строку');
        }
    }

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
