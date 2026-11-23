import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtConfirmPopoverComponent } from '../../rt-confirm-popover.component';
import { IRtConfirmPopover } from '../../rt-confirm-popover.model';
import { RtConfirmDirective } from '../../rt-confirm.directive';

/** Короткая подпись кнопки подтверждения — у всех случаев наполнения, кроме длинной. */
const SHORT_CONFIRM: string = 'Удалить';

/** Короткий вопрос — у всех случаев наполнения, кроме длинного. */
const SHORT_QUESTION: string = 'Удалить запись? Действие необратимо.';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TConfirmMatrixPart = 'tone' | 'content' | 'presets' | 'themes' | 'panel';

/** Тон подтверждающей кнопки — единственное, что окрашивает панель. */
interface IConfirmToneCase {
    readonly name: string;
    readonly tone: IRtConfirmPopover.Tone;
}

/** Наполнение панели: заголовок и длина вопроса. */
interface IConfirmContentCase {
    readonly name: string;
    readonly title: string | null;
    readonly message: string;
    /** Подпись кнопки подтверждения: длинная раздвигает панель. */
    readonly confirmLabel: string;
}

/**
 * Матрицы состояний `[rtConfirm]` и `rt-confirm-popover` для витрины.
 *
 * Тон и наполнение показаны **самой панелью**, поставленной в разметку: `rt-confirm-popover` —
 * обычный компонент, и в оверлее ему быть не обязательно. Так три тона встают рядом, чего под
 * директивой не бывает: щелчок по второму триггеру закрыл бы первую панель.
 *
 * Директива показана отдельной историей: панель открывает `play`-функция, нажимая кнопку.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-confirm-matrix',
    template: `
        @switch (part) {
            @case ('tone') {
                <app-story-presets caption="Тон подтверждения в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="toneCases" [itemLabel]="caseLabel">
                            <ng-template let-toneCase>
                                <rt-confirm-popover
                                    title="Удаление"
                                    message="Удалить запись? Действие необратимо."
                                    confirmLabel="Удалить"
                                    cancelLabel="Отмена"
                                    [tone]="toneCase.tone" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('content') {
                <app-story-presets caption="Наполнение панели в обоих наборах">
                    <ng-template>
                        <!-- Ширину ячейке не задаём: панель берёт ширину по кнопкам сама, и ячейка по
                             содержимому получает именно её. -->
                        <app-story-row [items]="contentCases" [itemLabel]="caseLabel">
                            <ng-template let-contentCase>
                                <rt-confirm-popover
                                    cancelLabel="Отмена"
                                    [confirmLabel]="contentCase.confirmLabel"
                                    [title]="contentCase.title"
                                    [message]="contentCase.message" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Панель в обоих наборах">
                    <ng-template>
                        <rt-confirm-popover
                            title="Удаление"
                            message="Удалить запись? Действие необратимо."
                            confirmLabel="Удалить"
                            cancelLabel="Отмена" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Панель в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <rt-confirm-popover
                                    title="Удаление"
                                    message="Удалить запись? Действие необратимо."
                                    confirmLabel="Удалить"
                                    cancelLabel="Отмена" />
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }

            @case ('panel') {
                <div class="app-confirm-matrix__panel-slot">
                    <rt-icon-button
                        icon="ico-trash"
                        variant="danger"
                        ariaLabel="Отклонить заявку"
                        rtConfirmTitle="Отклонить заявку"
                        rtConfirmLabel="Отклонить"
                        [rtConfirm]="'Отклонить заявку? Оператор получит уведомление.'"
                        [attr.data-story-trigger]="triggerAttribute" />
                </div>
            }
        }
    `,
    styles: `
        /* Панель директивы уезжает в контейнер оверлеев и встаёт под кнопкой: без запаса она
           вышла бы за нижний край окна. Кнопка сдвинута вправо — панель прижата к её правому
           краю, и у левого края окна прижатие не увидеть. */
        .app-confirm-matrix__panel-slot {
            display: flex;
            justify-content: flex-end;
            padding-bottom: 16rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtConfirmDirective,
        RtConfirmPopoverComponent,
        RtIconButtonComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtConfirmMatrixComponent {
    public part: TConfirmMatrixPart = 'tone';

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public readonly toneCases: readonly IConfirmToneCase[] = [
        { name: 'danger', tone: 'danger' },
        { name: 'warning', tone: 'warning' },
        { name: 'primary', tone: 'primary' },
    ];

    public readonly contentCases: readonly IConfirmContentCase[] = [
        { name: 'с заголовком', title: 'Удаление', message: SHORT_QUESTION, confirmLabel: SHORT_CONFIRM },
        { name: 'без заголовка', title: null, message: SHORT_QUESTION, confirmLabel: SHORT_CONFIRM },
        {
            name: 'длинный вопрос',
            title: 'Удаление',
            message: 'Запись будет удалена вместе с приложенными файлами и историей изменений. Восстановить её будет нельзя.',
            confirmLabel: SHORT_CONFIRM,
        },
        {
            name: 'длинная подпись кнопки',
            title: 'Удаление',
            message: SHORT_QUESTION,
            confirmLabel: 'Удалить без возможности восстановления',
        },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
