import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtTag } from '../../../tag/rt-tag.model';
import { RtMessageComponent } from '../../rt-message.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TMessageMatrixPart = 'severity' | 'icon' | 'closable' | 'content' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-message` для витрины.
 *
 * Главная ось — важность: она задаёт и палитру, и иконку по умолчанию. С иконкой она
 * перемножена, потому что своя иконка перебивает подобранную по важности, а `hideIcon` убирает
 * обе, — расхождение видно только на этой паре.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-message-matrix',
    template: `
        @switch (part) {
            @case ('severity') {
                <app-story-presets caption="Важность в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="22rem" [items]="severities">
                            <ng-template let-severity>
                                <rt-message [severity]="severity">Договор подписан обеими сторонами</rt-message>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('icon') {
                <app-story-presets caption="Важность × иконка в обоих наборах">
                    <ng-template>
                        <app-story-grid slotWidth="20rem" [rows]="severities" [columns]="iconCases">
                            <ng-template let-severity let-iconCase="col">
                                <rt-message
                                    [severity]="severity"
                                    [icon]="iconCase === 'своя иконка' ? 'star' : null"
                                    [hideIcon]="iconCase === 'без иконки'">
                                    Договор подписан
                                </rt-message>
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('closable') {
                <app-story-presets caption="Кнопка закрытия в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="22rem" [items]="closables" [itemLabel]="closableLabel">
                            <ng-template let-value>
                                <rt-message severity="info" [closable]="value">Договор подписан обеими сторонами</rt-message>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('content') {
                <app-story-presets caption="Чем наполнено в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="22rem" [items]="contents">
                            <ng-template let-content>
                                @switch (content) {
                                    @case ('одна строка') {
                                        <rt-message severity="info">Договор подписан</rt-message>
                                    }
                                    @case ('несколько строк') {
                                        <rt-message severity="warning">
                                            Срок действия договора истекает через тридцать дней. Продление происходит автоматически, если ни
                                            одна из сторон не заявила об отказе.
                                        </rt-message>
                                    }
                                    @case ('с разметкой') {
                                        <rt-message severity="danger">
                                            Не удалось сохранить:
                                            <a href="#">открыть журнал</a>
                                        </rt-message>
                                    }
                                    @case ('пусто') {
                                        <rt-message severity="info" />
                                    }
                                }
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Сообщения в обоих наборах">
                    <ng-template>
                        <div style="display: grid; gap: 0.5rem; width: 20rem">
                            @for (severity of severities; track severity) {
                                <rt-message [severity]="severity">Договор подписан</rt-message>
                            }
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Сообщения в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div style="display: grid; gap: 0.5rem; width: 20rem">
                                    @for (severity of severities; track severity) {
                                        <rt-message [severity]="severity">Договор подписан</rt-message>
                                    }
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMessageComponent,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtMessageMatrixComponent {
    public part: TMessageMatrixPart = 'severity';

    public readonly severities: readonly IRtTag.Severity[] = ['info', 'success', 'warning', 'danger', 'secondary', 'neutral'];

    /** Своя иконка перебивает подобранную по важности; `hideIcon` убирает обе. */
    public readonly iconCases: readonly string[] = ['по важности', 'своя иконка', 'без иконки'];

    public readonly closables: readonly boolean[] = [false, true];
    public readonly contents: readonly string[] = ['одна строка', 'несколько строк', 'с разметкой', 'пусто'];

    public readonly closableLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'closable — крестик справа' : 'без кнопки';
}
