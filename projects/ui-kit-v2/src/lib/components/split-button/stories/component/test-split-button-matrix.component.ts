import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtSplitButtonComponent } from '../../rt-split-button.component';
import { IRtSplitButton } from '../../rt-split-button.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type SplitButtonMatrixPart = 'theme' | 'size' | 'states' | 'themes' | 'panel';

/** Состояние, которое задаётся не псевдоклассом, а входом. */
interface ISplitButtonStateCase {
    readonly name: string;
    readonly loading: boolean;
    readonly disabled: boolean;
}

/**
 * Матрицы состояний `rt-split-button` для витрины.
 *
 * Палитра и размер не перемножены: размер меняет только высоту и отступы, и на всех шести
 * палитрах он один и тот же.
 *
 * **Открытое меню в истории одно.** Поповер висит на всём контроле, и щелчок по второй каретке
 * для CDK — указатель за пределами первой панели: она закрывается. Виды пунктов показаны
 * набором внутри одного меню.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-split-button-matrix',
    template: `
        @switch (part) {
            @case ('theme') {
                <app-story-row caption="Палитра" [items]="themes">
                    <ng-template let-theme>
                        <rt-split-button label="Сохранить" [theme]="theme" [menuItems]="menuItems" />
                    </ng-template>
                </app-story-row>
            }

            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes">
                    <ng-template let-size>
                        <rt-split-button label="Сохранить" [size]="size" [menuItems]="menuItems" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" [items]="states" [itemLabel]="stateLabel">
                    <ng-template let-state>
                        <rt-split-button label="Сохранить" [menuItems]="menuItems" [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>

                <app-story-row caption="Загрузка и недоступность" [items]="stateCases" [itemLabel]="caseLabel">
                    <ng-template let-stateCase>
                        <rt-split-button
                            label="Сохранить"
                            [loading]="stateCase.loading"
                            [disabled]="stateCase.disabled"
                            [menuItems]="menuItems" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Кнопка в обеих темах">
                    <ng-template>
                        <rt-split-button label="Сохранить" [menuItems]="menuItems" />
                        <rt-split-button label="Удалить" theme="danger" [menuItems]="menuItems" />
                        <rt-split-button label="Сохранение…" [loading]="true" [menuItems]="menuItems" />
                    </ng-template>
                </app-story-themes>
            }

            @case ('panel') {
                <div class="app-split-button-matrix__panel-slot">
                    <rt-split-button label="Сохранить" [menuItems]="menuItems" [attr.data-story-trigger]="triggerAttribute" />
                </div>
            }
        }
    `,
    styles: `
        /* Меню уезжает в контейнер оверлеев и встаёт под кнопкой: без запаса снизу оно вышло бы
           за нижний край окна. */
        .app-split-button-matrix__panel-slot {
            display: inline-flex;
            padding-bottom: 14rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSplitButtonComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtSplitButtonMatrixComponent {
    public part: SplitButtonMatrixPart = 'theme';

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;
    public readonly states: readonly IStoryState[] = STORY_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    public readonly themes: readonly IRtSplitButton.Theme[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];
    public readonly sizes: readonly IRtSplitButton.Size[] = ['sm', 'md', 'lg', 'xl', '2xl'];

    /**
     * Пункты меню — правдоподобные, а не пустой массив: с пустым каретка раскрывала бы полосу
     * без единой строки, то есть показывала отсутствие меню вместо меню. Отключённый пункт
     * нужен, чтобы в раскрытом меню была видна и недоступность.
     */
    public readonly menuItems: readonly IRtSplitButton.MenuItem[] = [
        { value: 'draft', label: 'Сохранить черновик', icon: 'ico-edit' },
        { value: 'copy', label: 'Сохранить копию', icon: 'ico-copy' },
        { value: 'template', label: 'Сохранить как шаблон', disabled: true },
    ];

    public readonly stateCases: readonly ISplitButtonStateCase[] = [
        { name: 'обычная', loading: false, disabled: false },
        { name: 'загрузка', loading: true, disabled: false },
        { name: 'недоступна', loading: false, disabled: true },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
