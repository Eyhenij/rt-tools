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
    templateUrl: './test-dynamic-selector-states.component.html',
    styleUrl: './test-dynamic-selector-states.component.scss',
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

    public readonly caseLabel: (value: IDynamicSelectorStateCase) => string = (value: IDynamicSelectorStateCase): string => value.name;
}
