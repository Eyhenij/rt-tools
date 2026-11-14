import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { RtIconButtonComponent } from '../../../../../../lib/components/icon-button/rt-icon-button.component';
import { PLACEHOLDER_MARK_BLOCK } from '../../../../../../lib/components/service-logo/stories/component/story-placeholder-marks';
import { RtChatEmptyDirective, RtChatErrorDirective } from '../../rt-chat-states.directive';
import { RtChatComponent } from '../../rt-chat.component';
import { IRtChat } from '../../rt-chat.model';
import { CHAT_MESSAGES } from './chat.fixture';

/** Случай чата: есть ли переписка, ошибка и какой свой шаблон стоит. */
interface IChatStateCase {
    readonly name: string;
    readonly hasThread: boolean;
    readonly error: string | null;
    readonly ownEmpty: boolean;
    readonly ownError: boolean;
}

const CASES: readonly IChatStateCase[] = [
    { name: 'Переписка не выбрана: заголовок, подсказка, иконка', hasThread: false, error: null, ownEmpty: false, ownError: false },
    { name: 'Ошибка загрузки переписки', hasThread: true, error: '', ownEmpty: false, ownError: false },
    { name: 'Свой шаблон пустого', hasThread: false, error: null, ownEmpty: true, ownError: false },
    { name: 'Свой шаблон ошибки', hasThread: true, error: 'Нет сети', ownEmpty: false, ownError: true },
];

/**
 * Заглушка без переписки и ошибка загрузки `rt-chat` в виде мессенджера — по одобренному кадру.
 * При ошибке лента и поле ответа скрыты, шапка остаётся.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chat-states',
    template: `
        <app-story-presets caption="Заглушка и ошибка в обоих наборах">
            <ng-template>
                <app-story-row slotWidth="560px" [items]="cases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <div
                            style="box-sizing: border-box; display: flex; flex-direction: column; inline-size: 100%; block-size: 520px; border: 1px solid var(--rt-color-border-default); border-radius: var(--rt-radius-lg); background-color: var(--rt-color-bg-surface)">
                            <rt-chat
                                style="height: 100%"
                                messenger
                                canReply
                                fill
                                title="№12 Анна Смирнова"
                                subtitle="WhatsApp · +66 81 234 5678"
                                emptyTitle="Переписка не выбрана"
                                emptyHint="Выберите переписку слева."
                                placeholder="Написать сообщение"
                                [sign]="sign"
                                [hasThread]="item.hasThread"
                                [error]="item.error"
                                [messages]="messages">
                                <rt-icon-button rtChatHeaderActions icon="calendar" variant="ghost" size="sm" ariaLabel="Бронирование" />
                                <rt-icon-button rtChatHeaderActions icon="ellipsis-v" variant="ghost" size="sm" ariaLabel="Ещё" />
                                @if (item.ownEmpty) {
                                    <ng-template rtChatEmpty>
                                        <div [style]="slotStyle">
                                            <strong>Свой вид пустой переписки</strong>
                                            <span [style]="slotHintStyle">Разметка приложения вместо подсказки по умолчанию</span>
                                        </div>
                                    </ng-template>
                                }
                                @if (item.ownError) {
                                    <ng-template rtChatError>
                                        <div [style]="slotStyle">
                                            <strong>Свой вид ошибки</strong>
                                            <span [style]="slotHintStyle">В контексте шаблона: текст ошибки ($implicit) и retry()</span>
                                        </div>
                                    </ng-template>
                                }
                            </rt-chat>
                        </div>
                    </ng-template>
                </app-story-row>
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtChatComponent,
        RtIconButtonComponent,

        // directives
        RtChatEmptyDirective,
        RtChatErrorDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtChatStatesComponent {
    public readonly cases: readonly IChatStateCase[] = CASES;
    public readonly messages: readonly IRtChat.Message[] = CHAT_MESSAGES;
    public readonly sign: typeof PLACEHOLDER_MARK_BLOCK = PLACEHOLDER_MARK_BLOCK;

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. */
    public readonly slotStyle: string =
        'display: grid; gap: var(--rt-space-2); margin: auto; padding: var(--rt-space-4); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); text-align: center';

    public readonly slotHintStyle: string = 'color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)';

    public readonly caseLabel: (value: IChatStateCase) => string = (value: IChatStateCase): string => value.name;
}
