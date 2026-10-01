import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { RtMessageComposerComponent } from '../../rt-message-composer.component';
import { TestComposerTextDirective } from './test-composer-text.directive';

/** Одно состояние макета: текст в поле, флаги и признак фокуса для аддона псевдосостояний. */
interface IComposerStateCase {
    readonly name: string;
    readonly text: string;
    readonly focus: boolean;
    readonly sending: boolean;
    readonly disabled: boolean;
}

const SHORT_TEXT: string = 'Да, можно с 13:00.';

const MULTILINE_TEXT: string = 'Да, можно заехать с 13:00. Ключи оставим в сейфе у двери, код пришлём за час до заезда.';

const LONG_TEXT: string = [
    'Добрый день! Бронь на 12–15',
    'октября. Можно ли заехать',
    'раньше — в 10:00? Если нет,',
    'где оставить вещи до',
    'заселения? И есть ли рядом',
    'парковка, сколько стоит?',
].join('\n');

const OVERFLOW_TEXT: string = [
    'Добрый день! Бронь на 12–15',
    ...Array.from({ length: 18 }, (_: unknown, index: number): string => `${index + 1}. Вопрос номер ${index + 1}.`),
    'Спасибо!',
].join('\n');

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TMessageComposerMatrixPart = 'state' | 'attachments' | 'formatting' | 'rows' | 'hint' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-message-composer` для витрины.
 *
 * Отправка разблокируется только при непустом содержимом, поэтому текст в поле набирает
 * директива витрины тем же событием `input`, что и человек, — компонент тот же, подделки нет.
 * Фокус в ряду может быть только у одной ячейки, поэтому его рисует признак состояния:
 * аддон псевдосостояний переписывает `:focus-within` капсулы на класс.
 *
 * `sending` и `disabled` при этом разные: первое — отправка в пути, второе — поле выключено
 * снаружи, и рядом видно, что блокируют они одно и то же, а означают разное.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-message-composer-matrix',
    template: `
        @switch (part) {
            @case ('state') {
                <app-story-presets caption="Состояние в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="22rem" [items]="states" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-message-composer
                                    attachments
                                    placeholder="Напишите сообщение…"
                                    [rtStoryComposerText]="item.text"
                                    [attr.data-story-state]="item.focus ? 'focus-within' : null"
                                    [sending]="item.sending"
                                    [disabled]="item.disabled" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('attachments') {
                <app-story-presets caption="Вложения в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="22rem" [items]="attachmentCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-message-composer
                                    placeholder="Написать сообщение"
                                    accept=".pdf,.png"
                                    [attachments]="item.attachments"
                                    [droppedFiles]="item.files" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('formatting') {
                <app-story-presets caption="Оформление текста в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="22rem" [items]="formattingCases" [itemLabel]="formattingLabel">
                            <ng-template let-value>
                                <rt-message-composer placeholder="Написать сообщение" [formatting]="value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('rows') {
                <app-story-presets caption="Высота поля в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="22rem" [items]="rowCases" [itemLabel]="rowsLabel">
                            <ng-template let-item>
                                <rt-message-composer placeholder="Написать сообщение" [minRows]="item.min" [maxRows]="item.max" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('hint') {
                <app-story-presets caption="Подсказка про Enter в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="22rem" [items]="hintCases" [itemLabel]="hintLabel">
                            <ng-template let-value>
                                <rt-message-composer attachments placeholder="Напишите сообщение…" [hint]="value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Поле в обоих наборах">
                    <ng-template>
                        <div style="width: 22rem">
                            <rt-message-composer attachments placeholder="Написать сообщение" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Поле в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div style="width: 22rem">
                                    <rt-message-composer
                                        attachments
                                        hint
                                        placeholder="Напишите сообщение…"
                                        [rtStoryComposerText]="shortText" />
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
        RtMessageComposerComponent,

        // showcase
        TestComposerTextDirective,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtMessageComposerMatrixComponent {
    public part: TMessageComposerMatrixPart = 'state';

    public readonly shortText: string = SHORT_TEXT;

    /** Девять состояний страницы макета в его порядке. Отправка в пути и выключенное поле блокируют одно и то же, а означают разное. */
    public readonly states: readonly IComposerStateCase[] = [
        { name: 'пустое', text: '', focus: false, sending: false, disabled: false },
        { name: 'фокус', text: '', focus: true, sending: false, disabled: false },
        { name: 'набор', text: SHORT_TEXT, focus: true, sending: false, disabled: false },
        { name: 'несколько строк', text: MULTILINE_TEXT, focus: true, sending: false, disabled: false },
        { name: 'sending — отправка в пути', text: SHORT_TEXT, focus: false, sending: true, disabled: false },
        { name: 'с текстом без фокуса', text: SHORT_TEXT, focus: false, sending: false, disabled: false },
        { name: 'disabled — выключено снаружи', text: '', focus: false, sending: false, disabled: true },
        { name: 'шесть строк — предел роста', text: LONG_TEXT, focus: true, sending: false, disabled: false },
        { name: 'дальше — прокрутка', text: OVERFLOW_TEXT, focus: true, sending: false, disabled: false },
    ];

    /** Файлы стоят внутри капсулы над строкой, поэтому один случай — с вложенным файлом. */
    public readonly attachmentCases: readonly { name: string; attachments: boolean; files: File[] | null }[] = [
        { name: 'без вложений', attachments: false, files: null },
        { name: 'скрепка есть', attachments: true, files: null },
        {
            name: 'с файлом',
            attachments: true,
            files: [new File([new Uint8Array(1_258_291)], 'dogovor-arendy-2026.pdf', { type: 'application/pdf' })],
        },
    ];

    public readonly hintCases: readonly boolean[] = [false, true];
    public readonly formattingCases: readonly boolean[] = [false, true];

    public readonly rowCases: readonly { name: string; min: number; max: number }[] = [
        { name: 'одна строка', min: 1, max: 4 },
        { name: 'три строки', min: 3, max: 6 },
    ];

    public readonly caseLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;

    public readonly hintLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'hint — строка про Enter' : 'без подсказки';

    public readonly formattingLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'formatting — панель оформления' : 'простой текст';

    public readonly rowsLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;
}
