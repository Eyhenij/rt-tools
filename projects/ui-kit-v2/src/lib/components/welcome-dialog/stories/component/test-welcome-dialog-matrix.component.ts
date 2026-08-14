import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDialogRef } from '../../../dialog/rt-dialog-ref';
import { RT_DIALOG_DATA } from '../../../dialog/rt-dialog.tokens';
import { IRtWelcomeDialog, RtWelcomeDialogComponent } from '../../rt-welcome-dialog.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type WelcomeDialogMatrixPart = 'text' | 'cta' | 'edges' | 'themes';

/**
 * Ссылка на окно, ничего не закрывающая.
 *
 * Настоящая держит перекрытие CDK и на нажатие кнопки убрала бы окно из показа — ячейка
 * матрицы опустела бы прямо во время просмотра.
 */
const STORY_DIALOG_REF: Pick<RtDialogRef, 'close'> = { close: (): void => undefined };

/** Текст окна приходит одной строкой: первый абзац становится заголовком, остальные — текстом. */
const FULL_MESSAGE: string = [
    'Добро пожаловать',
    'Здесь собраны договоры вашей организации и всё, что к ним приложено.',
    'Настройки колонок и фильтры сохраняются между заходами.',
].join('\n\n');

/** Одна ячейка матрицы: своё окно со своими данными, поэтому данные — провайдером на компонент. */
@Component({
    selector: 'app-welcome-dialog-case',
    template: '<rt-welcome-dialog />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtWelcomeDialogComponent],
})
class WelcomeDialogCaseComponent {}

@Component({
    selector: 'app-welcome-dialog-full',
    template: '<app-welcome-dialog-case />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [WelcomeDialogCaseComponent],
    providers: [
        { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
        { provide: RT_DIALOG_DATA, useValue: { message: FULL_MESSAGE } satisfies IRtWelcomeDialog.Data },
    ],
})
class WelcomeDialogFullComponent {}

@Component({
    selector: 'app-welcome-dialog-title-only',
    template: '<app-welcome-dialog-case />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [WelcomeDialogCaseComponent],
    providers: [
        { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
        { provide: RT_DIALOG_DATA, useValue: { message: 'Добро пожаловать' } satisfies IRtWelcomeDialog.Data },
    ],
})
class WelcomeDialogTitleOnlyComponent {}

@Component({
    selector: 'app-welcome-dialog-custom-cta',
    template: '<app-welcome-dialog-case />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [WelcomeDialogCaseComponent],
    providers: [
        { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
        {
            provide: RT_DIALOG_DATA,
            useValue: { message: FULL_MESSAGE, ctaLabel: 'Перейти к договорам' } satisfies IRtWelcomeDialog.Data,
        },
    ],
})
class WelcomeDialogCustomCtaComponent {}

@Component({
    selector: 'app-welcome-dialog-empty',
    template: '<app-welcome-dialog-case />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [WelcomeDialogCaseComponent],
    providers: [
        { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
        { provide: RT_DIALOG_DATA, useValue: { message: '' } satisfies IRtWelcomeDialog.Data },
    ],
})
class WelcomeDialogEmptyComponent {}

/**
 * Матрицы состояний `rt-welcome-dialog` для витрины.
 *
 * **Входов у окна нет**: текст и подпись кнопки приходят данными открытия, то есть через
 * внедрение. Поэтому каждая ячейка — свой маленький компонент со своим провайдером данных:
 * один инжектор на всю матрицу отдал бы всем ячейкам одно и то же.
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
                <app-story-row caption="Из чего собран текст" slotWidth="24rem" [items]="textCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        @switch (item.kind) {
                            @case ('full') {
                                <app-welcome-dialog-full />
                            }
                            @case ('title-only') {
                                <app-welcome-dialog-title-only />
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('cta') {
                <app-story-row caption="Подпись кнопки" slotWidth="24rem" [items]="ctaCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        @switch (item.kind) {
                            @case ('default') {
                                <app-welcome-dialog-full />
                            }
                            @case ('custom') {
                                <app-welcome-dialog-custom-cta />
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="24rem" [items]="edgeCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        @switch (item.kind) {
                            @case ('empty') {
                                <app-welcome-dialog-empty />
                            }
                            @case ('title-only') {
                                <app-welcome-dialog-title-only />
                            }
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Окно приветствия в обеих темах">
                    <ng-template>
                        <app-welcome-dialog-full />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // cases
        WelcomeDialogFullComponent,
        WelcomeDialogTitleOnlyComponent,
        WelcomeDialogCustomCtaComponent,
        WelcomeDialogEmptyComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtWelcomeDialogMatrixComponent {
    public part: WelcomeDialogMatrixPart = 'text';

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
