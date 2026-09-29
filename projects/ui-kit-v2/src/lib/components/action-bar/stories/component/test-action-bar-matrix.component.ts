import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtActionBarComponent } from '../../rt-action-bar.component';
import { IRtActionBar } from '../../rt-action-bar.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TActionBarMatrixPart = 'counter' | 'actions' | 'wrap' | 'presets' | 'themes';

/** Один случай ряда: подпись ячейки и настройка, которую показывает полоса. */
interface ICase {
    readonly label: string;
    readonly config: IRtActionBar.Config;
}

const PLAIN_ACTIONS: readonly IRtActionBar.Action[] = [{ label: 'Скачать' }, { label: 'Перенести' }];

function config(selected: number, total: number, actions: readonly IRtActionBar.Action[] = PLAIN_ACTIONS): IRtActionBar.Config {
    return { selected, total, actions };
}

/**
 * Матрицы состояний полосы массовых действий для витрины.
 *
 * **Матрицы целятся в саму полосу, а не в держатель.** Держатель приколот к окну и своего вида
 * не имеет вовсе: он решает, стоит ли полоса в разметке, и где над страницей она висит. Его
 * показ — своя история, и в ней он стоит в коробке, которая ему содержащий блок и которая
 * обрезает.
 *
 * Отдельным случаем показан ряд действий, не влезший в предел ширины: полоса обещает перенос, и
 * увидеть его можно только там, где место уже ряда. Кадр одной полосы на широком месте об этом
 * молчит.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-action-bar-matrix',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        @switch (part) {
            @case ('counter') {
                <app-story-presets caption="Счёт выбранного в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="30rem" [items]="counterCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-action-bar [config]="item.config" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('actions') {
                <app-story-presets caption="Виды действий в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="30rem" [items]="actionCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-action-bar [config]="item.config" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('wrap') {
                <app-story-presets caption="Ряд, не влезший в место, переносится">
                    <ng-template>
                        <app-story-row slotWidth="26rem" [items]="wrapCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-action-bar [config]="item.config" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Полоса целиком в обоих наборах" fill>
                    <ng-template>
                        <rt-action-bar [config]="fullConfig" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Светлая и тёмная тема рядом">
                    <ng-template>
                        <rt-action-bar [config]="fullConfig" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtActionBarComponent, StoryPresetsComponent, StoryRowComponent, StoryThemesComponent],
})
export class TestRtActionBarMatrixComponent {
    public part: TActionBarMatrixPart = 'counter';

    public readonly counterCases: readonly ICase[] = [
        { label: 'ничего не выбрано', config: config(0, 128) },
        { label: 'выбрано три', config: config(3, 128) },
        { label: 'длинные числа', config: config(1284567, 98765432) },
    ];

    public readonly actionCases: readonly ICase[] = [
        { label: 'обычные', config: config(3, 128) },
        {
            label: 'со значком',
            config: config(3, 128, [
                { label: 'Скачать', icon: 'ico-download' },
                { label: 'Удалить', icon: 'trash' },
            ]),
        },
        { label: 'опасное', config: config(3, 128, [{ label: 'Скачать' }, { label: 'Удалить', icon: 'trash', look: 'danger' }]) },
        {
            label: 'с вложенным списком',
            config: config(3, 128, [{ label: 'Отправить', icon: 'send', menu: [{ label: 'Письмом' }, { label: 'В чат' }] }]),
        },
    ];

    public readonly wrapCases: readonly ICase[] = [
        { label: 'два действия', config: config(3, 128) },
        {
            label: 'четыре действия',
            config: config(3, 128, [{ label: 'Скачать' }, { label: 'Перенести' }, { label: 'Объединить' }, { label: 'Удалить' }]),
        },
        { label: 'долгая подпись', config: config(3, 128, [{ label: 'Перенести в архив за прошлый год' }]) },
    ];

    public readonly fullConfig: IRtActionBar.Config = config(3, 128, [
        { label: 'Скачать', icon: 'ico-download' },
        { label: 'Отправить', icon: 'send', menu: [{ label: 'Письмом' }, { label: 'В чат' }] },
        { label: 'Удалить', icon: 'trash', look: 'danger' },
    ]);

    public readonly caseLabel: (value: ICase) => string = (value: ICase): string => value.label;
}
