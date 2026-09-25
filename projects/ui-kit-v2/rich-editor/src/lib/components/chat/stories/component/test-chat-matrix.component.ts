import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../../../src/showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../../../src/showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../../../src/showcase/story-themes.component';
import { RtMenuItemComponent } from '../../../../../../../src/lib/components/menu/rt-menu-item.component';
import { RtChatMessageActionsDirective } from '../../rt-chat-message-actions.directive';
import { RtChatComponent } from '../../rt-chat.component';
import { ERtChatMessageStatus, IRtChat } from '../../rt-chat.model';
import { CHAT_MESSAGES, CHAT_PEER } from './chat.fixture';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TChatMatrixPart =
    'thread' | 'messageKind' | 'status' | 'messageActions' | 'reply' | 'header' | 'loading' | 'presets' | 'themes';

const NOW: string = '2026-03-14T16:02:00.000Z';

/**
 * Матрицы состояний `rt-chat` для витрины.
 *
 * Каждый чат стоит в ящике с заданными размерами и поверхностью, и это не украшение показа.
 *
 * Высота: хост чата — колоночная гибкая коробка без своей высоты, размер ему даёт потребитель, и
 * для приложения это верно. В показе потребитель — ящик. Без `height: 100%` на самом чате он
 * мерился по содержимому: 37 точек в ящике высотой 352, а в кадре висели отдельные куски.
 *
 * Ширина: половина набора ужимает ребёнка без ширины по содержимому — чат мерился 217 точками при
 * ячейке в 384.
 *
 * Фон и рамка: свой фон чат рисует только в полноэкранном виде, в обычном его даёт потребитель.
 * Без фона по кадру нельзя было сказать, где чат кончается.
 *
 * Размеры написаны прямо в разметке, а не собраны в `styles`: проверка однообразия называет такой
 * блок стилями не в своём файле, и у обёрток показа этого дерева они пишутся так.
 *
 * Показывать надо не перечисление входов, а состояния экрана, которые между собой не сводятся:
 *
 * - **Без `hasThread` чат рисует только подсказку выбора** — ни ленты, ни поля ответа. Это
 *   «переписка не выбрана», а не «переписка пустая», и рядом эти два случая различаются.
 * - **Шапка появляется только вместе с кнопками**: один заголовок её не создаёт.
 * - **Поле ответа гейтится `canReply`**: когда отвечать нельзя, вместо него стоит причина.
 *
 * Виды сообщения — своё, чужое, системное, с вложением — стоят одной лентой: порознь не видно,
 * что своё прижато вправо, а чужое влево.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chat-matrix',
    template: `
        @switch (part) {
            @case ('thread') {
                <app-story-presets caption="Выбрана ли переписка в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="24rem" [items]="threadCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <div
                                    style="box-sizing: border-box; inline-size: 100%; block-size: 22rem; padding: 1rem; border: 1px solid var(--rt-color-border-subtle); border-radius: var(--rt-radius-lg); background-color: var(--rt-color-bg-surface)">
                                    <rt-chat
                                        style="height: 100%"
                                        canReply
                                        title="Договор №2024-118"
                                        emptyHint="Выберите переписку слева"
                                        placeholder="Написать сообщение"
                                        [hasThread]="item.hasThread"
                                        [messages]="item.messages" />
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('messageKind') {
                <app-story-presets caption="Вид реплики в обоих наборах">
                    <ng-template>
                        <div
                            style="box-sizing: border-box; inline-size: 26rem; block-size: 24rem; padding: 1rem; border: 1px solid var(--rt-color-border-subtle); border-radius: var(--rt-radius-lg); background-color: var(--rt-color-bg-surface)">
                            <rt-chat
                                style="height: 100%"
                                hasThread
                                canReply
                                title="Договор №2024-118"
                                placeholder="Написать сообщение"
                                [messages]="messages" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('status') {
                <app-story-presets caption="Состояние своей реплики в обоих наборах">
                    <ng-template>
                        <div
                            style="box-sizing: border-box; inline-size: 26rem; block-size: 24rem; padding: 1rem; border: 1px solid var(--rt-color-border-subtle); border-radius: var(--rt-radius-lg); background-color: var(--rt-color-bg-surface)">
                            <rt-chat
                                style="height: 100%"
                                hasThread
                                canReply
                                title="Свои сообщения"
                                placeholder="Написать сообщение"
                                [messages]="statusMessages" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('messageActions') {
                <app-story-presets caption="Действия у реплики в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="24rem" [items]="actionCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <!-- Ширина названа явно: слот ряда — flex-контейнер, и переписка без
                                     собственной ширины сжимается в нём до нуля. Кнопки у реплики
                                     проявляются наведением, поэтому на ячейке стоит признак состояния. -->
                                <div
                                    style="box-sizing: border-box; inline-size: 100%; block-size: 22rem; padding: 1rem; border: 1px solid var(--rt-color-border-subtle); border-radius: var(--rt-radius-lg); background-color: var(--rt-color-bg-surface)"
                                    [attr.data-story-state]="'hover'">
                                    <rt-chat
                                        style="height: 100%"
                                        hasThread
                                        title="Договор №2024-118"
                                        placeholder="Написать сообщение"
                                        [messages]="actionMessages"
                                        [messageHasActions]="item.predicate">
                                        @if (item.declared) {
                                            <ng-template rtChatMessageActions let-message>
                                                <rt-menu-item icon="link" [label]="'Ссылка на ' + message.text" />
                                            </ng-template>
                                        }
                                    </rt-chat>
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('reply') {
                <app-story-presets caption="Можно ли отвечать в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="24rem" [items]="replyCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <div
                                    style="box-sizing: border-box; inline-size: 100%; block-size: 22rem; padding: 1rem; border: 1px solid var(--rt-color-border-subtle); border-radius: var(--rt-radius-lg); background-color: var(--rt-color-bg-surface)">
                                    <rt-chat
                                        style="height: 100%"
                                        hasThread
                                        title="Договор №2024-118"
                                        placeholder="Написать сообщение"
                                        [messages]="messages"
                                        [canReply]="item.canReply"
                                        [replyBlockReason]="item.reason"
                                        [sending]="item.sending" />
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('header') {
                <app-story-presets caption="Когда появляется шапка в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="24rem" [items]="headerCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <div
                                    style="box-sizing: border-box; inline-size: 100%; block-size: 22rem; padding: 1rem; border: 1px solid var(--rt-color-border-subtle); border-radius: var(--rt-radius-lg); background-color: var(--rt-color-bg-surface)">
                                    <rt-chat
                                        style="height: 100%"
                                        hasThread
                                        canReply
                                        placeholder="Написать сообщение"
                                        title="Договор №2024-118"
                                        [messages]="messages"
                                        [showRefresh]="item.refresh"
                                        [showExpand]="item.expand" />
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('loading') {
                <app-story-presets caption="Загрузка и догрузка в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="24rem" [items]="loadingCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <div
                                    style="box-sizing: border-box; inline-size: 100%; block-size: 22rem; padding: 1rem; border: 1px solid var(--rt-color-border-subtle); border-radius: var(--rt-radius-lg); background-color: var(--rt-color-bg-surface)">
                                    <rt-chat
                                        style="height: 100%"
                                        hasThread
                                        canReply
                                        title="Договор №2024-118"
                                        placeholder="Написать сообщение"
                                        [messages]="item.empty ? none : messages"
                                        [loading]="item.loading"
                                        [fetching]="item.fetching" />
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Переписка в обоих наборах">
                    <ng-template>
                        <div
                            style="box-sizing: border-box; inline-size: 24rem; block-size: 22rem; padding: 1rem; border: 1px solid var(--rt-color-border-subtle); border-radius: var(--rt-radius-lg); background-color: var(--rt-color-bg-surface)">
                            <rt-chat
                                style="height: 100%"
                                hasThread
                                canReply
                                title="Договор №2024-118"
                                placeholder="Написать сообщение"
                                [messages]="messages" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Переписка в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div
                                    style="box-sizing: border-box; inline-size: 24rem; block-size: 22rem; padding: 1rem; border: 1px solid var(--rt-color-border-subtle); border-radius: var(--rt-radius-lg); background-color: var(--rt-color-bg-surface)">
                                    <rt-chat
                                        style="height: 100%"
                                        hasThread
                                        canReply
                                        title="Договор №2024-118"
                                        placeholder="Написать сообщение"
                                        [messages]="messages" />
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
        RtChatComponent,
        RtChatMessageActionsDirective,
        RtMenuItemComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtChatMatrixComponent {
    public part: TChatMatrixPart = 'thread';

    public readonly messages: readonly IRtChat.Message[] = CHAT_MESSAGES;
    public readonly none: readonly IRtChat.Message[] = [];

    /** Все четыре состояния своего сообщения: чужому сообщать о доставке нечего. */
    public readonly statusMessages: readonly IRtChat.Message[] = [
        { id: 11, author: 'Вы', own: true, status: ERtChatMessageStatus.Sending, text: 'Отправляется', createdAt: NOW },
        { id: 12, author: 'Вы', own: true, status: ERtChatMessageStatus.Sent, text: 'Доставлено', createdAt: NOW },
        { id: 13, author: 'Вы', own: true, status: ERtChatMessageStatus.Read, text: 'Прочитано', createdAt: NOW },
        { id: 14, author: 'Вы', own: true, status: ERtChatMessageStatus.Failed, text: 'Не ушло', createdAt: NOW },
    ];

    public readonly threadCases: readonly { name: string; hasThread: boolean; messages: readonly IRtChat.Message[] }[] = [
        { name: 'переписка не выбрана', hasThread: false, messages: [] },
        { name: 'выбрана и пуста', hasThread: true, messages: [] },
        { name: 'выбрана с сообщениями', hasThread: true, messages: CHAT_MESSAGES },
    ];

    /** Две реплики: своя и чужая — на них видно, как признак гасит точку действий у одной. */
    public readonly actionMessages: readonly IRtChat.Message[] = [
        { id: 21, author: CHAT_PEER, own: false, text: 'Договор на согласовании', createdAt: NOW },
        { id: 22, author: 'Вы', own: true, status: ERtChatMessageStatus.Read, text: 'Спасибо, ждём', createdAt: NOW },
    ];

    public readonly actionCases: readonly {
        name: string;
        declared: boolean;
        predicate: IRtChat.MessageActionsPredicate | null;
    }[] = [
        { name: 'шаблон не объявлен', declared: false, predicate: null },
        { name: 'объявлен, признака нет', declared: true, predicate: null },
        { name: 'признак гасит свою реплику', declared: true, predicate: (message: IRtChat.Message): boolean => !message.own },
    ];

    public readonly replyCases: readonly { name: string; canReply: boolean; reason: string | null; sending: boolean }[] = [
        { name: 'отвечать можно', canReply: true, reason: null, sending: false },
        { name: 'отправка в пути', canReply: true, reason: null, sending: true },
        { name: 'отвечать нельзя — причина', canReply: false, reason: 'Переписка закрыта', sending: false },
        { name: 'нельзя, причина не названа', canReply: false, reason: null, sending: false },
    ];

    public readonly headerCases: readonly { name: string; refresh: boolean; expand: boolean }[] = [
        { name: 'один заголовок — шапки нет', refresh: false, expand: false },
        { name: 'с обновлением', refresh: true, expand: false },
        { name: 'с разворотом', refresh: false, expand: true },
        { name: 'обе кнопки', refresh: true, expand: true },
    ];

    public readonly loadingCases: readonly { name: string; loading: boolean; fetching: boolean; empty: boolean }[] = [
        { name: 'сообщения на месте', loading: false, fetching: false, empty: false },
        { name: 'первая загрузка', loading: true, fetching: false, empty: true },
        { name: 'догрузка сверху', loading: false, fetching: true, empty: false },
    ];

    public readonly caseLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;
}
