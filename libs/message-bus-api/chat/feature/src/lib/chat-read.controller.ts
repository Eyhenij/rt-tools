/**
 * `GET /api/chat/conversations`, `GET /api/chat/conversations/:id/messages`,
 * `GET /api/chat/conversations/stream` и `POST /api/chat/conversations/:id/state` — сторона
 * оператора.
 *
 * Все четыре закрыты входом человека, а не ключом сайта: ключ лежит в странице сайта открыто, и
 * закрытое им чтение отдавало бы разговоры посетителей всякому, кто открыл код страницы.
 *
 * Оператор видит переписки своих сайтов, и чужие в ответ не попадают вовсе: набор сайтов идёт в
 * сам запрос. Вошедший, который оператором чата не является, получает пустую страницу — его набор
 * сайтов пуст, и разницы между «нет сайтов» и «нет переписок» в ответе нет.
 *
 * Поток событий стоит здесь же, а не отдельной поверхностью: он закрыт тем же входом и отвечает
 * за те же сайты, а добор пропущенного после обрыва идёт чтением сообщений с названной минутой.
 */
import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, Req, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';

import { SessionOperation } from '@rt/message-bus-api/access/util';
import { accountOf, IAccountBearingRequest, IRequestAccount } from '@rt/message-bus-api/accounts/util';
import {
    appendOperatorMessage,
    conversationOfSites,
    conversationsPage,
    IChatConversationListRow,
    IChatMessageListRow,
    messagesPage,
    operatorSites,
    setConversationState,
} from '@rt/message-bus-api/chat/data-access';
import { CHAT_TEXT_LIMIT, chatStateOf, chatTextFault, EChatTextFault, missedSince } from '@rt/message-bus-api/chat/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { EChatTalkState, ERefusal, IPage, pageAsked, pageFault, refusalBody } from '@rt/message-bus-common';

import { ChatSubscribersService, IChatFrame } from './chat-subscribers.service';

/** Поля порядка списка переписок. Первое — умолчание: свежие разговоры стоят первыми. */
const CONVERSATION_SORTABLE: readonly string[] = ['lastMessageAt'];

/** Поля порядка списка сообщений: разговор читается с начала. */
const MESSAGE_SORTABLE: readonly string[] = ['takenAt'];

/** Ответ на смену состояния переписки. */
interface IChatStateChanged {
    readonly id: string;
    readonly state: string;
}

@Controller('chat/conversations')
export class ChatReadController {
    readonly #prisma: PrismaService;
    readonly #subscribers: ChatSubscribersService;

    constructor(prisma: PrismaService, subscribers: ChatSubscribersService) {
        this.#prisma = prisma;
        this.#subscribers = subscribers;
    }

    /**
     * Страница переписок оператора.
     *
     * Сайт, за который он не отвечает, даёт пустую страницу, а не отказ: отказ ответил бы на
     * вопрос «а такой сайт есть?» тому, кому спрашивать нечего.
     */
    @Get()
    @SessionOperation()
    public async page(
        @Query() query: Record<string, unknown>,
        @Req() request: IAccountBearingRequest
    ): Promise<IPage<IChatConversationListRow>> {
        const fault: string | null = pageFault(query, CONVERSATION_SORTABLE);

        if (fault) {
            throw new BadRequestException(fault);
        }

        const state: EChatTalkState | null = query['state'] === undefined ? null : this.#state(query['state']);
        const site: unknown = query['site'];

        return conversationsPage(
            this.#prisma,
            await this.#sites(request),
            { siteId: typeof site === 'string' && site.trim() ? site.trim() : null, state },
            pageAsked(query, CONVERSATION_SORTABLE)
        );
    }

    /** Страница сообщений одной переписки. Чужая переписка отвечает как ненайденная. */
    @Get(':id/messages')
    @SessionOperation()
    public async messages(
        @Param('id') id: string,
        @Query() query: Record<string, unknown>,
        @Req() request: IAccountBearingRequest
    ): Promise<IPage<IChatMessageListRow>> {
        const fault: string | null = pageFault(query, MESSAGE_SORTABLE);

        if (fault) {
            throw new BadRequestException(fault);
        }

        await this.#own(request, id);

        return messagesPage(this.#prisma, id, pageAsked(query, MESSAGE_SORTABLE), missedSince(query['since']));
    }

    /**
     * Поток событий оператора: его читает панель.
     *
     * Закрыт входом человека и несёт события тех сайтов, за которые он отвечает, — набор тот же,
     * с которым работает чтение: второй ответ на вопрос «чей это разговор» разошёлся бы с первым.
     * Вошедший, который оператором чата не является, получает открытый поток без событий: его
     * набор сайтов пуст, и это не отказ — он вошёл, просто отвечать ему не за что.
     */
    @Get('stream')
    @SessionOperation()
    @Sse()
    public async stream(@Req() request: IAccountBearingRequest): Promise<Observable<IChatFrame>> {
        return this.#subscribers.stream({ conversationId: null, siteIds: await this.#sites(request) });
    }

    /**
     * Ответ оператора посетителю.
     *
     * Пишется операцией, а не потоком: поток только разносит событие о реплике, и вторая дорога
     * для записи дала бы два порядка сообщений в одном разговоре. Чужая переписка отвечает как
     * ненайденная — тем же отказом, что и чтение.
     *
     * Минута приёма приезжает последним доводом, а не читается часами внутри: порядок сообщений
     * решается ею, и спека проверяет его вызовом.
     */
    @Post(':id/messages')
    @SessionOperation()
    public async answer(
        @Param('id') id: string,
        @Body() body: unknown,
        @Req() request: IAccountBearingRequest,
        at: Date = new Date()
    ): Promise<IChatMessageListRow> {
        const fields: Record<string, unknown> = (body ?? {}) as Record<string, unknown>;
        const text: string = typeof fields['text'] === 'string' ? fields['text'].trim() : '';
        const talk: { id: string; siteId: string; state: string } = await this.#own(request, id);
        const fault: EChatTextFault | null = chatTextFault(text);

        if (fault === EChatTextFault.Empty) {
            throw new BadRequestException(refusalBody(ERefusal.ChatTextEmpty));
        }

        if (fault === EChatTextFault.TooLong) {
            throw new BadRequestException(refusalBody(ERefusal.ChatTextTooLong, { limit: CHAT_TEXT_LIMIT }));
        }

        const message: IChatMessageListRow = await appendOperatorMessage(this.#prisma, talk.id, text, at);

        this.#subscribers.send(
            { conversationId: talk.id, siteId: talk.siteId },
            {
                text,
                conversationId: talk.id,
                messageId: message.id,
                side: message.side,
                takenAt: message.takenAt.toISOString(),
            }
        );

        return message;
    }

    /** Смена состояния переписки: закрыть разговор или открыть его снова. */
    @Post(':id/state')
    @SessionOperation()
    public async state(@Param('id') id: string, @Body() body: unknown, @Req() request: IAccountBearingRequest): Promise<IChatStateChanged> {
        const fields: Record<string, unknown> = (body ?? {}) as Record<string, unknown>;
        const asked: EChatTalkState = this.#state(fields['state']);

        await this.#own(request, id);

        return setConversationState(this.#prisma, id, asked);
    }

    /** Сайты вошедшего. Пусто — он не оператор чата, и видеть ему нечего. */
    async #sites(request: IAccountBearingRequest): Promise<string[]> {
        const account: IRequestAccount = accountOf(request);

        return operatorSites(this.#prisma, account.id);
    }

    /** Переписка своего сайта. Чужая и несуществующая отвечают одинаково. */
    async #own(request: IAccountBearingRequest, id: string): Promise<{ id: string; siteId: string; state: string }> {
        const found: { id: string; siteId: string; state: string } | null = await conversationOfSites(
            this.#prisma,
            await this.#sites(request),
            id
        );

        if (!found) {
            throw new NotFoundException(refusalBody(ERefusal.ChatConversationNotFound));
        }

        return found;
    }

    /** Состояние из запроса. Слово не из набора — отказ, и набор назван в нём. */
    #state(value: unknown): EChatTalkState {
        const state: EChatTalkState | null = chatStateOf(value);

        if (!state) {
            throw new BadRequestException(refusalBody(ERefusal.ChatStateUnknown));
        }

        return state;
    }
}
