import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtDynamicSelectorPopupComponent } from '../../popup/rt-dynamic-selector-popup.component';
import { RtDynamicSelectorEmptyDirective, RtDynamicSelectorErrorDirective } from '../../rt-dynamic-selector.directives';
import { IStoryPerson, STORY_PEOPLE } from './test-dynamic-selector.component';

/** Случай окна выбора: какие записи, какая ошибка и какой свой шаблон стоит. */
interface IDynamicSelectorStateCase {
    readonly name: string;
    readonly entities: readonly IStoryPerson[];
    readonly error: string | null;
    readonly ownEmpty: boolean;
    readonly ownError: boolean;
}

const CASES: readonly IDynamicSelectorStateCase[] = [
    { name: 'Ошибка загрузки: error не null, retry по кнопке', entities: STORY_PEOPLE, error: '', ownEmpty: false, ownError: false },
    { name: 'Свой шаблон пустого: ng-template[rtDynamicSelectorEmpty]', entities: [], error: null, ownEmpty: true, ownError: false },
    {
        name: 'Свой шаблон ошибки: ng-template[rtDynamicSelectorError]',
        entities: STORY_PEOPLE,
        error: 'Нет сети',
        ownEmpty: false,
        ownError: true,
    },
];

/**
 * Ошибка загрузки и свои шаблоны окна выбора `rt-dynamic-selector` — по одобренному кадру. Окно
 * стоит в разметке, как в истории `Popup`: в оверлее открытое окно было бы одно, а случаев три.
 * При ошибке нет ни «Применить», ни «Выбрать все».
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-dynamic-selector-states',
    template: `
        <app-story-presets caption="Ошибка и свои шаблоны окна выбора в обоих наборах">
            <ng-template>
                <app-story-row slotWidth="20rem" [items]="cases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-dynamic-selector-popup
                            keyExp="id"
                            displayExp="name"
                            mode="multiple"
                            [entities]="item.entities"
                            [error]="item.error">
                            @if (item.ownEmpty) {
                                <ng-template rtDynamicSelectorEmpty let-term>
                                    <div [style]="slotStyle">
                                        <strong>Свой вид пустого</strong>
                                        <span [style]="slotHintStyle">Разметка приложения вместо rt-empty-state</span>
                                    </div>
                                </ng-template>
                            }
                            @if (item.ownError) {
                                <ng-template rtDynamicSelectorError>
                                    <div [style]="slotStyle">
                                        <strong>Свой вид ошибки</strong>
                                        <span [style]="slotHintStyle">В контексте шаблона: текст ошибки ($implicit) и retry()</span>
                                    </div>
                                </ng-template>
                            }
                        </rt-dynamic-selector-popup>
                    </ng-template>
                </app-story-row>
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDynamicSelectorPopupComponent,

        // directives
        RtDynamicSelectorEmptyDirective,
        RtDynamicSelectorErrorDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtDynamicSelectorStatesComponent {
    public readonly cases: readonly IDynamicSelectorStateCase[] = CASES;

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. */
    public readonly slotStyle: string =
        'display: grid; gap: var(--rt-space-2); margin-block: var(--rt-space-6); padding: var(--rt-space-4); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); text-align: center';

    public readonly slotHintStyle: string = 'color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)';

    public readonly caseLabel: (value: IDynamicSelectorStateCase) => string = (value: IDynamicSelectorStateCase): string => value.name;
}
