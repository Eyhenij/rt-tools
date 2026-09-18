/**
 * `GET /api/invites`, `POST /api/invites` и `DELETE /api/invites/:name` — приглашения в админке.
 *
 * Операции закрыты входом человека: приглашения выдаёт владелец, и читает их он же. Токен дерева
 * их не открывает — дерево своё приглашение уже погасило, а чужие его не касаются.
 *
 * Код приглашения отдаёт одна только выдача, и одним этим ответом: в хранилище лежит только
 * хеш, и показать код второй раз неоткуда. Список говорит имя, состояние и сроки — по ним
 * владелец решает, ждать ему или выдавать заново.
 *
 * Состояние считается на момент запроса, а не хранится колонкой: просроченность наступает сама
 * собой, и записанная однажды она соврала бы через час после того, как её записали.
 */
import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Delete,
    Get,
    Logger,
    NotFoundException,
    Param,
    Post,
    Query,
} from '@nestjs/common';

import { RequiresRight } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { findLiveInviteByName, IStoredInvite, readInvites, revokeInvite } from '@rt/message-bus-api/trees/data-access';
import { EInviteRefusal, inviteState } from '@rt/message-bus-api/trees/util';
import {
    ERefusal,
    ETreeInviteView,
    IPage,
    ITreeInviteIssued,
    ITreeInviteView,
    pageAsked,
    pageFault,
    refusalBody,
    TREE_INVITE_SORTABLE,
} from '@rt/message-bus-common';

import { IInviteOutcome, issueInvite } from './invite-issue';

@Controller('invites')
export class InvitesReadController {
    readonly #prisma: PrismaService;
    readonly #log: Logger = new Logger(InvitesReadController.name);

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Страница приглашений, свежие сверху.
     *
     * Приезжают страницей, как и остальные списки админки, хотя приглашений единицы: страницу,
     * порядок и повтор чтения экрану даёт одна общая основа, и список, отвечающий не её формой,
     * пришлось бы читать в обход неё.
     *
     * Погашенные из списка не уходят: по ним читается, что дерево завелось и каким приглашением.
     *
     * Момент приходит последним доводом, а не читается часами внутри: им считается
     * просроченность каждой строки, и спека проверяет её вызовом. Каркас отдачи этот довод не
     * заполняет — у него нет метки, — и в бою работает умолчание.
     */
    @Get()
    @RequiresRight('invites:read')
    public async page(@Query() query: Record<string, unknown>, at: Date = new Date()): Promise<IPage<ITreeInviteView>> {
        const fault: string | null = pageFault(query, TREE_INVITE_SORTABLE);

        if (fault) {
            throw new BadRequestException(fault);
        }

        const page: IPage<IStoredInvite> = await readInvites(this.#prisma, pageAsked(query, TREE_INVITE_SORTABLE));

        return { ...page, rows: page.rows.map((invite: IStoredInvite): ITreeInviteView => this.#view(invite, at)) };
    }

    /**
     * Выдача приглашения владельцем.
     *
     * Отказ называет, чем занято имя, — в отличие от обращения дерева за токеном, где разница
     * ответов сказала бы постороннему, какие коды заведены. Здесь спрашивает вошедший владелец,
     * и список приглашений вместе со списком деревьев виден ему целиком.
     *
     * Момент приходит последним доводом, а не читается часами внутри: им решается годность
     * занявшего приглашения и срок выдаваемого, и спека проверяет их вызовом. Каркас отдачи
     * этот довод не заполняет — у него нет метки, — и в бою работает умолчание.
     */
    @Post()
    @RequiresRight('invites:manage')
    public async issue(@Body() body: unknown, at: Date = new Date()): Promise<ITreeInviteIssued> {
        const fields: Record<string, unknown> = (body ?? {}) as Record<string, unknown>;
        const raw: unknown = fields['name'];
        const name: string = typeof raw === 'string' ? raw.trim() : '';

        if (!name) {
            throw new BadRequestException(refusalBody(ERefusal.InviteNameEmpty));
        }

        const outcome: IInviteOutcome = await issueInvite(this.#prisma, name, at);

        if (outcome.refusal === EInviteRefusal.TreeExists) {
            throw new ConflictException(refusalBody(ERefusal.InviteProjectExists, { name }));
        }

        if (outcome.refusal === EInviteRefusal.InviteLive || !outcome.issued) {
            throw new ConflictException(refusalBody(ERefusal.InviteAlreadyIssued, { name }));
        }

        // В журнал уходит имя дерева и только оно: ни кода, ни его хеша здесь нет — строка лога
        // переживает и выкатку, и снятый дамп, а код живёт до первого использования
        this.#log.log({ event: 'invite-issued', name });

        return {
            name: outcome.issued.name,
            code: outcome.issued.code,
            issuedAt: outcome.issued.issuedAt.toISOString(),
            expiresAt: outcome.issued.expiresAt.toISOString(),
        };
    }

    /**
     * Отзыв приглашения до того, как им воспользовались.
     *
     * Погашенное и уже отозванное отзывать нечего — на них отвечает «не найдено»: годного
     * приглашения с этим именем нет, и разницы между «не было вовсе» и «стало негодным» для
     * этого действия не существует.
     *
     * Момент приходит последним доводом тем же приёмом, что и у выдачи: им решается годность
     * отзываемого, и он же становится временем отзыва.
     */
    @Delete(':name')
    @RequiresRight('invites:manage')
    public async revoke(@Param('name') name: string, at: Date = new Date()): Promise<ITreeInviteView> {
        const live: IStoredInvite | null = await findLiveInviteByName(this.#prisma, name);

        if (!live || inviteState(live, at) !== ETreeInviteView.Waiting) {
            throw new NotFoundException(refusalBody(ERefusal.InviteNotFound, { name }));
        }

        await revokeInvite(this.#prisma, live.id, at);

        return this.#view({ ...live, revokedAt: at }, at);
    }

    /** Приглашение в строку списка: времена уезжают строкой, состояние считается на момент запроса. */
    #view(invite: IStoredInvite, at: Date): ITreeInviteView {
        return {
            name: invite.name,
            state: inviteState(invite, at),
            issuedAt: invite.issuedAt.toISOString(),
            expiresAt: invite.expiresAt.toISOString(),
            treeSlug: invite.treeSlug,
        };
    }
}
