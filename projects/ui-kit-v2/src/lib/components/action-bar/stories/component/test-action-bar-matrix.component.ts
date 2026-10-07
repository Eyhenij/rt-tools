import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtActionBarComponent } from '../../rt-action-bar.component';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { IRtActionBar } from '../../rt-action-bar.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TActionBarMatrixPart = 'counter' | 'actions' | 'wrap' | 'properties' | 'menu' | 'presets' | 'themes';

/**
 * Свойства, которые приложение ставит на тег полосы. Инлайн-стиль — самое сильное правило на
 * теге: если свойство не дошло и от него, его не достанет и правило приложения.
 */
interface IStyleCase {
    readonly label: string;
    readonly style: Readonly<Record<string, string>>;
    /** Свойства на предке полосы: с RT-2619 они доходят до неё и оттуда. */
    readonly ancestorStyle?: Readonly<Record<string, string>>;
    readonly closeIcon?: IRtIcon.Name;
}

/** Один случай ряда: подпись ячейки и настройка, которую показывает полоса. */
interface ICase {
    readonly label: string;
    readonly config: IRtActionBar.Config;
}

/** Действие «Скачать» со значком — стоит в нескольких показах. */
const DOWNLOAD: IRtActionBar.Action = { label: 'Скачать', icon: 'ico-download' };

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

            @case ('properties') {
                <app-story-presets caption="Цвета, отступы и шрифт с тега полосы в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="30rem" [items]="styleCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <!-- Обёртка без коробки: ячейка ряда отдаёт ширину полосе, а свойства предка наследуются. -->
                                <div style="display: contents" [style]="item.ancestorStyle ?? {}">
                                    <rt-action-bar [config]="fullConfig" [style]="item.style" [closeIcon]="item.closeIcon ?? 'close'" />
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('menu') {
                <!-- Без пары наборов: меню раскрывается по одному на историю, второй жест закрыл бы первое.
                     Кадр снимается целой страницей, и меню под полосой в него входит. -->
                <rt-action-bar data-story-trigger [config]="menuConfig" />
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
            config: config(3, 128, [DOWNLOAD, { label: 'Удалить', icon: 'trash' }]),
        },
        { label: 'опасное', config: config(3, 128, [{ label: 'Скачать' }, { label: 'Удалить', icon: 'trash', look: 'danger' }]) },
        {
            label: 'с вложенным списком',
            config: config(3, 128, [{ label: 'Отправить', icon: 'send', menu: [{ label: 'Письмом' }, { label: 'В чат' }] }]),
        },
        {
            label: 'имя Material',
            config: config(3, 128, [{ label: 'Стереть', glyph: 'delete_forever', look: 'danger' }]),
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
        DOWNLOAD,
        { label: 'Отправить', icon: 'send', menu: [{ label: 'Письмом' }, { label: 'В чат' }] },
        { label: 'Удалить', icon: 'trash', look: 'danger' },
    ]);

    /** Первым стоит действие со списком: его кнопку история и нажимает. */
    public readonly menuConfig: IRtActionBar.Config = config(3, 128, [
        {
            label: 'Отправить',
            icon: 'send',
            menu: [{ label: 'Письмом' }, { label: 'В чат' }, { label: 'Удалить из рассылки', look: 'danger' }],
        },
        DOWNLOAD,
    ]);

    /** Кит без свойств и светлая полоса с плотными отступами и полужирным счётом. */
    public readonly styleCases: readonly IStyleCase[] = [
        { label: 'кит', style: {} },
        {
            label: 'свойства приложения',
            style: {
                '--rt-action-bar-bg': 'var(--rt-color-bg-surface)',
                '--rt-action-bar-color': 'var(--rt-color-text-primary)',
                '--rt-action-bar-padding': 'var(--rt-space-1) var(--rt-space-2)',
                '--rt-action-bar-gap': 'var(--rt-space-2)',
                '--rt-action-bar-font-size': 'var(--rt-text-xs)',
                '--rt-action-bar-counter-weight': 'var(--rt-font-weight-semibold)',
                '--rt-action-bar-action-padding-block': 'var(--rt-space-0-5)',
                '--rt-action-bar-action-padding-inline': 'var(--rt-space-1)',
                '--rt-action-bar-action-weight': 'var(--rt-font-weight-regular)',
            },
        },
        {
            label: 'на предке и новые свойства',
            style: {},
            closeIcon: 'times-circle',
            ancestorStyle: {
                '--rt-action-bar-action-height': 'var(--rt-control-height-md)',
                '--rt-action-bar-action-font-size': 'var(--rt-text-md)',
                '--rt-action-bar-icon-size': 'var(--rt-size-5)',
                '--rt-action-bar-icon-gap': 'var(--rt-space-1)',
                '--rt-action-bar-counter-font-size': 'var(--rt-text-md)',
                '--rt-action-bar-close-size': 'var(--rt-control-height-md)',
                '--rt-action-bar-close-icon-size': 'var(--rt-size-5)',
            },
        },
    ];

    public readonly caseLabel: (value: { readonly label: string }) => string = (value: { readonly label: string }): string => value.label;
}
