import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../../../src/showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../../../src/showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../../../src/showcase/story-themes.component';
import { RtMessageComposerComponent } from '../../rt-message-composer.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TMessageComposerMatrixPart = 'state' | 'attachments' | 'formatting' | 'rows' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-message-composer` для витрины.
 *
 * Поле начинается пустым, и **отправка разблокируется только при непустом содержимом** — значит
 * кнопка в матрицах будет заблокированной везде, кроме случая с вложенным файлом. Это не
 * недосмотр: набранный текст витриной не подделывается, а показывать поле «как будто с текстом»
 * значило бы показывать не тот компонент.
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
                                <rt-message-composer placeholder="Написать сообщение" [sending]="item.sending" [disabled]="item.disabled" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('attachments') {
                <app-story-presets caption="Вложения в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="22rem" [items]="attachmentCases" [itemLabel]="attachmentLabel">
                            <ng-template let-value>
                                <rt-message-composer placeholder="Написать сообщение" accept=".pdf,.png" [attachments]="value" />
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
                                    <rt-message-composer attachments placeholder="Написать сообщение" />
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
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtMessageComposerMatrixComponent {
    public part: TMessageComposerMatrixPart = 'state';

    /** Отправка в пути и выключенное снаружи поле блокируют одно и то же, а означают разное. */
    public readonly states: readonly { name: string; sending: boolean; disabled: boolean }[] = [
        { name: 'обычное', sending: false, disabled: false },
        { name: 'sending — отправка в пути', sending: true, disabled: false },
        { name: 'disabled — выключено снаружи', sending: false, disabled: true },
    ];

    public readonly attachmentCases: readonly boolean[] = [false, true];
    public readonly formattingCases: readonly boolean[] = [false, true];

    public readonly rowCases: readonly { name: string; min: number; max: number }[] = [
        { name: 'одна строка', min: 1, max: 4 },
        { name: 'три строки', min: 3, max: 6 },
    ];

    public readonly caseLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;

    public readonly attachmentLabel: (value: boolean) => string = (value: boolean): string => (value ? 'скрепка есть' : 'без вложений');

    public readonly formattingLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'formatting — панель оформления' : 'простой текст';

    public readonly rowsLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;
}
