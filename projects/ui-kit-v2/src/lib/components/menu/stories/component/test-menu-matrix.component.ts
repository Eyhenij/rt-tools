import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { RtMenuItemComponent } from '../../rt-menu-item.component';
import { RtMenuComponent } from '../../rt-menu.component';
import { IRtMenu } from '../../rt-menu.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type MenuMatrixPart = 'trigger' | 'states' | 'themes' | 'panel';

/** Триггер: иконка и недоступность вместе — недоступный триггер меню не раскрывает. */
interface IMenuTriggerCase {
    readonly name: string;
    readonly icon: IRtIcon.Name;
    readonly disabled: boolean;
}

/**
 * Матрицы состояний `rt-menu` для витрины.
 *
 * **Открытая панель в истории ровно одна.** Панель меню лежит поверх страницы вместе с
 * прозрачным backdrop'ом, и жест по второму триггеру достаётся этому backdrop'у: первое меню
 * закрывается, второе не открывается. Поэтому сторона раскрытия показана двумя историями, а
 * виды пунктов — набором внутри одной панели.
 *
 * Панель уезжает в контейнер оверлеев CDK — за пределы блока истории, поэтому в светло-тёмной
 * паре стоит триггер, а цвет пунктов показывает пара в группе историй `Components/MenuItem`.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-menu-matrix',
    template: `
        @switch (part) {
            @case ('trigger') {
                <app-story-row caption="Триггер" [items]="triggerCases" [itemLabel]="caseLabel">
                    <ng-template let-triggerCase>
                        <rt-menu [icon]="triggerCase.icon" [disabled]="triggerCase.disabled" [ariaLabel]="triggerCase.name">
                            <rt-menu-item label="Открыть" icon="ico-eye" />
                        </rt-menu>
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие с триггером" [items]="states" [itemLabel]="stateLabel">
                    <ng-template let-state>
                        <rt-menu ariaLabel="Действия" [attr.data-story-state]="state.state">
                            <rt-menu-item label="Открыть" icon="ico-eye" />
                        </rt-menu>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Триггер в обеих темах">
                    <ng-template>
                        <rt-menu ariaLabel="Действия">
                            <rt-menu-item label="Открыть" icon="ico-eye" />
                        </rt-menu>
                        <rt-menu icon="ico-edit" ariaLabel="Правка">
                            <rt-menu-item label="Изменить" icon="ico-edit" />
                        </rt-menu>
                        <rt-menu ariaLabel="Недоступно" [disabled]="true">
                            <rt-menu-item label="Открыть" icon="ico-eye" />
                        </rt-menu>
                    </ng-template>
                </app-story-themes>
            }

            @case ('panel') {
                <div class="app-menu-matrix__panel-slot" [class.app-menu-matrix__panel-slot--end]="align === 'end'">
                    <rt-menu ariaLabel="Действия со строкой" [align]="align" [attr.data-story-trigger]="triggerAttribute">
                        <rt-menu-item label="Открыть" icon="ico-eye" />
                        <rt-menu-item label="Изменить" icon="ico-edit" />
                        <rt-menu-item label="Скопировать" icon="ico-copy" [disabled]="true" />
                        <rt-menu-item
                            label="Удалить"
                            icon="ico-trash"
                            confirmMessage="Удалить запись? Действие необратимо."
                            confirmTitle="Удаление"
                            [danger]="true" />
                    </rt-menu>
                </div>
            }
        }
    `,
    styles: `
        /* Панель лежит поверх страницы: без запаса снизу она вышла бы за нижний край окна.
           Правое выравнивание видно только тогда, когда триггеру есть куда прижаться. */
        .app-menu-matrix__panel-slot {
            display: flex;
            padding-bottom: 16rem;
        }

        .app-menu-matrix__panel-slot--end {
            justify-content: flex-end;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMenuComponent,
        RtMenuItemComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtMenuMatrixComponent {
    public part: MenuMatrixPart = 'trigger';
    public align: IRtMenu.Align = 'end';

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;
    public readonly states: readonly IStoryState[] = STORY_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    public readonly triggerCases: readonly IMenuTriggerCase[] = [
        { name: 'умолчание', icon: 'ellipsis-h', disabled: false },
        { name: 'своя иконка', icon: 'ico-edit', disabled: false },
        { name: 'недоступен', icon: 'ellipsis-h', disabled: true },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
