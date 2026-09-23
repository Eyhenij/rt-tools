/**
 * Разговор со стороны отвечающего: своя переписка, реплика оператора и смена состояния.
 *
 * Отвечающих двое — оператор в панели приёмника и человек потребителя на встраиваемой странице, —
 * а разговор один. Вторая дорога к записи дала бы два порядка сообщений в одной переписке и два
 * решения о том, чья переписка чужая; здесь она одна, а контроллеры отличаются только тем, откуда
 * берётся набор сайтов: у панели он от учётной записи, у страницы — из признака.
 *
 * Минута приёма приезжает доводом, а не читается часами внутри: порядок сообщений решается ею, и
 * спека проверяет его вызовом.
 */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import {
    appendOperatorMessage,
    conversationOfSites,
    findSiteById,
    IChatOwnedTalk,
    IChatMessageListRow,
    IChatSiteRow,
    setConversationState,
} from '@rt/message-bus-api/chat/data-access';
import { CHAT_TEXT_LIMIT, chatStateOf, chatTextFault, EChatTextFault } from '@rt/message-bus-api/chat/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { EChatTalkState, ERefusal, refusalBody } from '@rt/message-bus-common';

import { ChatHookService } from './chat-hook.service';
import { ChatSubscribersService } from './chat-subscribers.service';

/** Ответ на смену состояния переписки. */
export interface IChatStateChanged {
    readonly id: string;
    readonly state: string;
}

/** Состояние из запроса. Слово не из набора — отказ, и набор назван в нём. */
export function chatStateAsked(value: unknown): EChatTalkState {
    const state: EChatTalkState | null = chatStateOf(value);

    if (!state) {
        throw new BadRequestException(refusalBody(ERefusal.ChatStateUnknown));
    }

    return state;
}

@Injectable()
export class ChatTalkService {
    readonly #prisma: PrismaService;
    readonly #subscribers: ChatSubscribersService;
    readonly #hooks: ChatHookService;

    constructor(prisma: PrismaService, subscribers: ChatSubscribersService, hooks: ChatHookService) {
        this.#prisma = prisma;
        this.#subscribers = subscribers;
        this.#hooks = hooks;
    }

    /** Переписка своего сайта. Чужая и несуществующая отвечают одинаково. */
    public async own(sites: readonly string[], id: string): Promise<IChatOwnedTalk> {
        const found: IChatOwnedTalk | null = await conversationOfSites(this.#prisma, sites, id);

        if (!found) {
            throw new NotFoundException(refusalBody(ERefusal.ChatConversationNotFound));
        }

        return found;
    }

    /** Реплика отвечающего в свою переписку: она же уходит событием тем, кто смотрит на разговор. */
    public async answer(sites: readonly string[], id: string, text: string, at: Date): Promise<IChatMessageListRow> {
        const talk: IChatOwnedTalk = await this.own(sites, id);
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

    /** Смена состояния своей переписки: закрыть разговор или открыть его снова. */
    public async state(sites: readonly string[], id: string, asked: EChatTalkState): Promise<IChatStateChanged> {
        const talk: IChatOwnedTalk = await this.own(sites, id);
        const changed: IChatStateChanged = await setConversationState(this.#prisma, id, asked);

        if (asked === EChatTalkState.Closed) {
            // вызов наружу ответа отвечающему не держит: приложение о закрытии узнаёт своим чередом
            void this.#sayClosed(talk.siteId, id);
        }

        return changed;
    }

    /**
     * Сказать приложению площадки, что переписку закрыли.
     *
     * Площадку читает отдельный запрос: список сайтов отвечающего несёт признаки, а не адрес
     * вызова с тайной — второе их чтение здесь же разошлось бы с первым молча.
     */
    async #sayClosed(siteId: string, conversationId: string): Promise<void> {
        const site: IChatSiteRow | null = await findSiteById(this.#prisma, siteId);

        if (!site) {
            return;
        }

        await this.#hooks.say(
            { id: site.id, key: site.key, hookUrl: site.hookUrl, hookSecret: site.hookSecret },
            'closing',
            { conversationId, fields: {} },
            new Date()
        );
    }
}
