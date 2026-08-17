/**
 * `GET /api/invites` и `DELETE /api/invites/:name` — приглашения в админке.
 *
 * Операции закрыты входом человека: приглашения выдаёт владелец, и читает их он же. Токен дерева
 * их не открывает — дерево своё приглашение уже погасило, а чужие его не касаются.
 *
 * Самого кода приглашения ни одна из них не отдаёт: в хранилище лежит только хеш, и показать код
 * второй раз неоткуда. Список говорит имя, состояние и сроки — по ним владелец решает, ждать ему
 * или выдавать заново.
 *
 * Состояние считается на момент запроса, а не хранится колонкой: просроченность наступает сама
 * собой, и записанная однажды она соврала бы через час после того, как её записали.
 */
import { Controller, Delete, Get, NotFoundException, Param } from '@nestjs/common';

import { SessionOperation } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { findLiveInviteByName, IStoredInvite, listInvites, revokeInvite } from '@rt/message-bus-api/trees/data-access';
import { inviteState } from '@rt/message-bus-api/trees/util';
import { ETreeInviteView, ITreeInviteView } from '@rt/message-bus-common';

@Controller('invites')
export class InvitesReadController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Все приглашения, свежие сверху. Страницами не приезжают: их столько же, сколько деревьев,
     * то есть единицы, — а погашенные остаются, потому что по ним читается, что дерево завелось.
     */
    @Get()
    @SessionOperation()
    public async all(): Promise<ITreeInviteView[]> {
        const at: Date = new Date();
        const invites: IStoredInvite[] = await listInvites(this.#prisma);

        return invites.map((invite: IStoredInvite): ITreeInviteView => this.#view(invite, at));
    }

    /**
     * Отзыв приглашения до того, как им воспользовались.
     *
     * Погашенное и уже отозванное отзывать нечего — на них отвечает «не найдено»: годного
     * приглашения с этим именем нет, и разницы между «не было вовсе» и «стало негодным» для
     * этого действия не существует.
     */
    @Delete(':name')
    @SessionOperation()
    public async revoke(@Param('name') name: string): Promise<ITreeInviteView> {
        const at: Date = new Date();
        const live: IStoredInvite | null = await findLiveInviteByName(this.#prisma, name);

        if (!live || inviteState(live, at) !== ETreeInviteView.Waiting) {
            throw new NotFoundException(`годного приглашения для «${name}» нет`);
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
