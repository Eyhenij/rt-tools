import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtCardComponent } from '../../rt-card.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TCardMatrixPart = 'header' | 'slots' | 'clickable' | 'states' | 'presets' | 'themes';

/** Случай шапки: имя для подписи ячейки и значение входа. */
interface ICardHeaderCase {
    readonly name: string;
    readonly header: string | null;
}

/**
 * Матрицы состояний `rt-card` для витрины.
 *
 * Своих значений у карточки два — заголовок и нажимаемость, — и обе оси двоичные. Показывать
 * надо не перечисление, а то, чем карточка наполнена: шапка входом и шапка проекцией дают
 * разный вид, а подвал существует всегда, даже пустым, и прячут его стили.
 *
 * Состояния указателя показаны только у нажимаемой: без `clickable` карточка не интерактивна
 * вовсе — ни роли, ни таб-порядка, ни правил наведения.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-card-matrix',
    template: `
        @switch (part) {
            @case ('header') {
                <app-story-row caption="Заголовок" slotWidth="16rem" [items]="headers" [itemLabel]="headerLabel">
                    <ng-template let-item>
                        <rt-card [header]="item.header">Договор №2024-118 от 14 марта</rt-card>
                    </ng-template>
                </app-story-row>
            }

            @case ('slots') {
                <app-story-row caption="Наполнение" slotWidth="16rem" [items]="slots">
                    <ng-template let-slot>
                        @switch (slot) {
                            @case ('только содержимое') {
                                <rt-card>Договор №2024-118 от 14 марта</rt-card>
                            }
                            @case ('заголовок входом') {
                                <rt-card header="Договор">Подписан 14 марта</rt-card>
                            }
                            @case ('шапка проекцией') {
                                <rt-card>
                                    <span rtCardHeader>Договор №2024-118</span>
                                    Подписан 14 марта
                                </rt-card>
                            }
                            @case ('с подвалом') {
                                <rt-card header="Договор">
                                    Подписан 14 марта
                                    <span rtCardFooter>Действует до 14 марта 2027</span>
                                </rt-card>
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('clickable') {
                <app-story-row caption="Нажимаемость" slotWidth="16rem" [items]="clickables" [itemLabel]="clickableLabel">
                    <ng-template let-value>
                        <rt-card header="Договор" ariaLabel="Открыть договор" [clickable]="value">Подписан 14 марта</rt-card>
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие — только у нажимаемой" slotWidth="16rem" [items]="states" [itemLabel]="stateLabel">
                    <ng-template let-state>
                        <rt-card clickable header="Договор" ariaLabel="Открыть договор" [attr.data-story-state]="state.state">
                            Подписан 14 марта
                        </rt-card>
                    </ng-template>
                </app-story-row>
            }

            @case ('presets') {
                <app-story-presets caption="Карточка в обоих наборах">
                    <ng-template>
                        <div style="width: 16rem">
                            <rt-card header="Договор">
                                Подписан 14 марта
                                <span rtCardFooter>Действует до 14 марта 2027</span>
                            </rt-card>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Карточка в обеих темах">
                    <ng-template>
                        <div style="width: 16rem">
                            <rt-card header="Договор">
                                Подписан 14 марта
                                <span rtCardFooter>Действует до 14 марта 2027</span>
                            </rt-card>
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCardComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtCardMatrixComponent {
    public part: TCardMatrixPart = 'header';

    public readonly headers: readonly ICardHeaderCase[] = [
        { name: 'без заголовка', header: null },
        { name: 'короткий', header: 'Договор' },
        { name: 'длинный', header: 'Договор на подключение дополнительного рабочего места' },
    ];

    public readonly slots: readonly string[] = ['только содержимое', 'заголовок входом', 'шапка проекцией', 'с подвалом'];

    public readonly clickables: readonly boolean[] = [false, true];

    public readonly states: readonly IStoryState[] = STORY_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    public readonly headerLabel: (value: ICardHeaderCase) => string = (value: ICardHeaderCase): string => value.name;

    public readonly clickableLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'clickable — роль и таб-порядок' : 'обычная — не интерактивна';
}
