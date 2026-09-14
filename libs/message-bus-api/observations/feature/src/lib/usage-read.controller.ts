/**
 * `GET /api/usage` и `GET /api/usage/:skill/sessions` — использование правил дерева за период.
 *
 * Обе операции закрыты правом `usage:read` — своим, не правом сводок: раздел свой, и закрытый
 * набор прав называет каждый раздел по имени. Вошедший видит любое дерево — учётная запись
 * принадлежит службе, а не дереву, и выбор дерева сужает показанное, а не доступ.
 *
 * Считает хранилище; здесь — разбор запроса, дерево по признаку и отказы: страница или порядок
 * не разобрались — `400`, период не двумя днями или длиннее предела — `400`, дерево не названо
 * или не найдено — `404`. Период, которого запрос не назвал, подставляет приёмник по своим часам,
 * и ответ его называет.
 */
import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { RequiresRight } from '@rt/message-bus-api/access/util';
import {
    findTreeIdBySlug,
    IUsageAsked,
    IUsagePage,
    IUsageSessionRow,
    readUsage,
    readUsageSessions,
} from '@rt/message-bus-api/observations/data-access';
import { IUsagePeriod, usagePeriodFault, usagePeriodOf, usageTreeOf } from '@rt/message-bus-api/observations/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPageAsked, pageAsked, pageFault, USAGE_SORTABLE } from '@rt/message-bus-common';

@Controller('usage')
export class UsageReadController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /** Страница таблицы скилов за период. Пустой период — пустая страница, а не отказ. */
    @Get()
    @RequiresRight('usage:read')
    public async usage(@Query() query: Record<string, unknown>): Promise<IUsagePage> {
        const fault: string | null = pageFault(query, USAGE_SORTABLE);

        if (fault) {
            throw new BadRequestException(fault);
        }
        const page: IPageAsked = pageAsked(query, USAGE_SORTABLE);

        return readUsage(this.#prisma, { ...page, ...(await this.#asked(query)) });
    }

    /** Сессии одного скила за период, свежий день первым. */
    @Get(':skill/sessions')
    @RequiresRight('usage:read')
    public async sessions(@Param('skill') skill: string, @Query() query: Record<string, unknown>): Promise<readonly IUsageSessionRow[]> {
        return readUsageSessions(this.#prisma, await this.#asked(query), skill);
    }

    /** Дерево и период из запроса. Отказы — по порядку чтения: сначала период, потом дерево. */
    async #asked(query: Record<string, unknown>, now: Date = new Date()): Promise<IUsageAsked> {
        const fault: string | null = usagePeriodFault(query);

        if (fault) {
            throw new BadRequestException(fault);
        }
        const slug: string = usageTreeOf(query);
        const treeId: string | null = slug ? await findTreeIdBySlug(this.#prisma, slug) : null;

        if (!treeId) {
            throw new NotFoundException('дерево с таким признаком не известно приёмнику');
        }
        const period: IUsagePeriod = usagePeriodOf(query, now);

        return { treeId, from: period.from, to: period.to };
    }
}
