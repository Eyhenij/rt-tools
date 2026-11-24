import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { TestRtWelcomeDialogCaseComponent } from './test-welcome-dialog-case.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TWelcomeDialogMatrixPart = 'text' | 'cta' | 'edges' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-welcome-dialog` для витрины.
 *
 * **Входов у окна нет**: текст и подпись кнопки приходят данными открытия, то есть через
 * внедрение. Поэтому ячейка — `app-welcome-dialog-case` со своим инжектором по входу `kind`.
 *
 * Кнопка закрытия в витрине ничего не закрывает: ссылка на окно подменена — иначе ячейка
 * опустела бы от первого же нажатия.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-welcome-dialog-matrix',
    template: `
        @switch (part) {
            @case ('text') {
                <app-story-presets caption="Из чего собран текст в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="24rem" [items]="textCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                @switch (item.kind) {
                                    @case ('full') {
                                        <app-welcome-dialog-case kind="full" />
                                    }
                                    @case ('title-only') {
                                        <app-welcome-dialog-case kind="title-only" />
                                    }
                                }
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('cta') {
                <app-story-presets caption="Подпись кнопки в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="24rem" [items]="ctaCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                @switch (item.kind) {
                                    @case ('default') {
                                        <app-welcome-dialog-case kind="full" />
                                    }
                                    @case ('custom') {
                                        <app-welcome-dialog-case kind="custom-cta" />
                                    }
                                }
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('edges') {
                <app-story-presets caption="Края в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="24rem" [items]="edgeCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                @switch (item.kind) {
                                    @case ('empty') {
                                        <app-welcome-dialog-case kind="empty" />
                                    }
                                    @case ('title-only') {
                                        <app-welcome-dialog-case kind="title-only" />
                                    }
                                }
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Окно приветствия в обоих наборах">
                    <ng-template>
                        <app-welcome-dialog-case kind="full" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Окно приветствия в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <app-welcome-dialog-case kind="full" />
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // cases
        TestRtWelcomeDialogCaseComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtWelcomeDialogMatrixComponent {
    public part: TWelcomeDialogMatrixPart = 'text';

    public readonly textCases: readonly { name: string; kind: string }[] = [
        { name: 'заголовок и два абзаца', kind: 'full' },
        { name: 'только заголовок', kind: 'title-only' },
    ];

    public readonly ctaCases: readonly { name: string; kind: string }[] = [
        { name: 'подпись по умолчанию', kind: 'default' },
        { name: 'своя подпись', kind: 'custom' },
    ];

    public readonly edgeCases: readonly { name: string; kind: string }[] = [
        { name: 'пустой текст — остаётся одна кнопка', kind: 'empty' },
        { name: 'один абзац', kind: 'title-only' },
    ];

    public readonly caseLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;
}
