import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import {
    IStoryState,
    STORY_STATE_DEFAULT,
    STORY_STATE_FOCUS_VISIBLE,
    STORY_STATE_HOVER,
    storyStateLabel,
} from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { RtMenuItemComponent } from '../../rt-menu-item.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type MenuItemMatrixPart = 'kinds' | 'states' | 'themes';

/** Вид пункта: иконка, деструктивность и недоступность вместе — порознь они не бывают. */
interface IMenuItemKindCase {
    readonly name: string;
    readonly label: string;
    readonly icon: IRtIcon.Name | null;
    readonly danger: boolean;
    readonly disabled: boolean;
    readonly confirmMessage: string;
}

/**
 * Матрицы состояний `rt-menu-item` для витрины.
 *
 * Пункт показан **вне панели меню**: он самостоятельный компонент и рисуется где угодно, а
 * панель уехала бы в контейнер оверлеев — за пределы блока истории, и ни ряд, ни светло-тёмная
 * пара его бы не поймали. Как он выглядит внутри панели, показывает матрица `Menu → Panel`.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-menu-item-matrix',
    template: `
        @switch (part) {
            @case ('kinds') {
                <app-story-row caption="Вид пункта" [items]="kindCases" [itemLabel]="caseLabel" [slotWidth]="itemWidth">
                    <ng-template let-kindCase>
                        <rt-menu-item
                            [label]="kindCase.label"
                            [icon]="kindCase.icon"
                            [danger]="kindCase.danger"
                            [disabled]="kindCase.disabled"
                            [confirmMessage]="kindCase.confirmMessage" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" [items]="states" [itemLabel]="stateLabel" [slotWidth]="itemWidth">
                    <ng-template let-state>
                        <rt-menu-item label="Открыть" icon="ico-eye" [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>

                <app-story-row caption="Наведение на недоступный" [items]="disabledStates" [itemLabel]="stateLabel" [slotWidth]="itemWidth">
                    <ng-template let-state>
                        <rt-menu-item label="Удалить" icon="ico-trash" [disabled]="true" [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Виды пунктов в обеих темах">
                    <ng-template>
                        @for (kindCase of kindCases; track kindCase.name) {
                            <rt-menu-item
                                [label]="kindCase.label"
                                [icon]="kindCase.icon"
                                [danger]="kindCase.danger"
                                [disabled]="kindCase.disabled" />
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMenuItemComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtMenuItemMatrixComponent {
    public part: MenuItemMatrixPart = 'kinds';

    /** Ширина ячейки: пункт занимает всю ширину родителя, и по содержимому он бы схлопнулся. */
    public readonly itemWidth: string = '12rem';

    public readonly states: readonly IStoryState[] = [STORY_STATE_DEFAULT, STORY_STATE_HOVER, STORY_STATE_FOCUS_VISIBLE];

    /** Отдельный ряд: у недоступного пункта наведение намеренно ничего не красит. */
    public readonly disabledStates: readonly IStoryState[] = [STORY_STATE_DEFAULT, STORY_STATE_HOVER];

    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    public readonly kindCases: readonly IMenuItemKindCase[] = [
        { name: 'обычный', label: 'Открыть', icon: null, danger: false, disabled: false, confirmMessage: '' },
        { name: 'с иконкой', label: 'Открыть', icon: 'ico-eye', danger: false, disabled: false, confirmMessage: '' },
        { name: 'деструктивный', label: 'Удалить', icon: 'ico-trash', danger: true, disabled: false, confirmMessage: '' },
        { name: 'недоступный', label: 'Удалить', icon: 'ico-trash', danger: false, disabled: true, confirmMessage: '' },
        {
            name: 'с подтверждением',
            label: 'Удалить',
            icon: 'ico-trash',
            danger: true,
            disabled: false,
            confirmMessage: 'Удалить запись? Действие необратимо.',
        },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
