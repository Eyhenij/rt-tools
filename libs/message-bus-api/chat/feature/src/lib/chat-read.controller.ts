/**
 * `GET /api/chat/conversations`, `GET /api/chat/conversations/:id/messages` и
 * `POST /api/chat/conversations/:id/state` — сторона оператора.
 *
 * Все три закрыты входом человека, а не ключом сайта: ключ лежит в странице сайта открыто, и
 * закрытое им чтение отдавало бы разговоры посетителей всякому, кто открыл код страницы.
 *
 * Оператор видит переписки своих сайтов, и чужие в ответ не попадают вовсе: набор сайтов идёт в
 * сам запрос. Вошедший, который оператором чата не является, получает пустую страницу — его набор
 * сайтов пуст, и разницы между «нет сайтов» и «нет переписок» в ответе нет.
 */
import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, Req } from '@nestjs/common';

import { SessionOperation } from '@rt/message-bus-api/access/util';
import { accountOf, IAccountBearingRequest, IRequestAccount } from '@rt/message-bus-api/accounts/util';
import {
    conversationOfSites,
    conversationsPage,
    IChatConversationListRow,
    IChatMessageListRow,
    messagesPage,
    operatorSites,
    setConversationState,
} from '@rt/message-bus-api/chat/data-access';
import { chatStateOf, EChatConversationState } from '@rt/message-bus-api/chat/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ERefusal, IPage, pageAsked, pageFault, refusalBody } from '@rt/message-bus-common';

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

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
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

        const state: EChatConversationState | null = query['state'] === undefined ? null : this.#state(query['state']);
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

        return messagesPage(this.#prisma, id, pageAsked(query, MESSAGE_SORTABLE));
    }

    /** Смена состояния переписки: закрыть разговор или открыть его снова. */
    @Post(':id/state')
    @SessionOperation()
    public async state(@Param('id') id: string, @Body() body: unknown, @Req() request: IAccountBearingRequest): Promise<IChatStateChanged> {
        const fields: Record<string, unknown> = (body ?? {}) as Record<string, unknown>;
        const asked: EChatConversationState = this.#state(fields['state']);

        await this.#own(request, id);

        return setConversationState(this.#prisma, id, asked);
    }

    /** Сайты вошедшего. Пусто — он не оператор чата, и видеть ему нечего. */
    async #sites(request: IAccountBearingRequest): Promise<string[]> {
        const account: IRequestAccount = accountOf(request);

        return operatorSites(this.#prisma, account.id);
    }

    /** Переписка своего сайта. Чужая и несуществующая отвечают одинаково. */
    async #own(request: IAccountBearingRequest, id: string): Promise<void> {
        const found: { id: string } | null = await conversationOfSites(this.#prisma, await this.#sites(request), id);

        if (!found) {
            throw new NotFoundException(refusalBody(ERefusal.ChatConversationNotFound));
        }
    }

    /** Состояние из запроса. Слово не из набора — отказ, и набор назван в нём. */
    #state(value: unknown): EChatConversationState {
        const state: EChatConversationState | null = chatStateOf(value);

        if (!state) {
            throw new BadRequestException(refusalBody(ERefusal.ChatStateUnknown));
        }

        return state;
    }
}
