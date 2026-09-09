/**
 * `GET /api/intake/mine` — свои записи дерева: состояние, починка и версия выпуска.
 *
 * Всё остальное чтение приёма закрыто входом человека, а учётной записи у потребителя нет и не
 * будет: её заводит хозяин приёмника, а деревьев столько же, сколько потребителей. Поэтому
 * операция закрыта токеном дерева — тем самым, которым уезжает груз.
 *
 * Чьи записи уезжают, решает операция, а не запрос: дерево берётся из токена. Названное доводом,
 * оно отдавало бы записи соседа тому, кто попросит.
 *
 * Стоит в домене состояния груза по той же причине, что и чтение версий: родов груза два, и
 * контроллер, лежащий у одного из них, знал бы про чужую либу.
 */
import { BadRequestException, Controller, Get, Query, Req } from '@nestjs/common';

import { TreeOperation } from '@rt/message-bus-api/access/util';
import { IOwnCargoResponse, IOwnCargoRow } from '@rt/message-bus-api/cargo-state/api';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPostmortemFullRow, readOwnPostmortems } from '@rt/message-bus-api/postmortems/data-access';
import { IProposalFullRow, readOwnProposals } from '@rt/message-bus-api/proposals/data-access';
import { IRequestTree, ITreeBearingRequest, treeOf } from '@rt/message-bus-api/trees/util';
import { cargoKindFault, cargoKindOf, ECargoKind, IPage, IPageAsked, pageAsked, pageFault } from '@rt/message-bus-common';

/**
 * Поля порядка, которые принимает своё чтение.
 *
 * Порядок один — свежие сверху, — и список пуст намеренно: довод `sort` со значением отбивается
 * отказом, а не молча меняет порядок ответа.
 */
const SORTABLE: readonly string[] = [];

@Controller('intake')
export class OwnCargoReadController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Страница своих записей названного рода.
     *
     * Род обязателен и умолчания не имеет: родов два, и подставленный молча показал бы дереву
     * половину его груза как весь.
     */
    @Get('mine')
    @TreeOperation()
    public async mine(@Query() query: Record<string, unknown>, @Req() request: ITreeBearingRequest): Promise<IOwnCargoResponse> {
        const fault: string | null = cargoKindFault(query) ?? pageFault(query, SORTABLE);

        if (fault) {
            throw new BadRequestException(fault);
        }

        const tree: IRequestTree = treeOf(request);
        const asked: IPageAsked = pageAsked(query, SORTABLE);

        return cargoKindOf(query['kind']) === ECargoKind.Proposal ? this.#proposals(tree.slug, asked) : this.#postmortems(tree.slug, asked);
    }

    /** Свои предложения: записью названо имя ресурса, о котором предложение написано. */
    async #proposals(slug: string, asked: IPageAsked): Promise<IOwnCargoResponse> {
        const page: IPage<IProposalFullRow> = await readOwnProposals(this.#prisma, slug, asked);

        return {
            total: page.total,
            page: page.page,
            size: page.size,
            rows: page.rows.map((row: IProposalFullRow): IOwnCargoRow => ({
                id: row.id,
                kind: ECargoKind.Proposal,
                name: row.resource,
                state: row.state,
                fixNote: row.fixNote,
                releaseVersion: row.releaseVersion,
                text: row.text,
            })),
        };
    }

    /** Свои разборы: записью названо имя файла — им же разбор опознаётся при правке состояния. */
    async #postmortems(slug: string, asked: IPageAsked): Promise<IOwnCargoResponse> {
        const page: IPage<IPostmortemFullRow> = await readOwnPostmortems(this.#prisma, slug, asked);

        return {
            total: page.total,
            page: page.page,
            size: page.size,
            rows: page.rows.map((row: IPostmortemFullRow): IOwnCargoRow => ({
                id: row.id,
                kind: ECargoKind.Postmortem,
                name: row.file,
                state: row.state,
                fixNote: row.fixNote,
                releaseVersion: row.releaseVersion,
                text: row.text,
            })),
        };
    }
}
