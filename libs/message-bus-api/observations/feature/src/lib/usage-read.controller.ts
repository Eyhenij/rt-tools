/**
 * `GET /api/usage` и `GET /api/usage/:skill/sessions` — использование правил дерева за период.
 *
 * Обе операции закрыты правом `usage:read` — своим, не правом сводок: раздел свой, и закрытый
 * набор прав называет каждый раздел по имени. Вошедший видит любое дерево — учётная запись
 * принадлежит службе, а не дереву, и выбор дерева сужает показанное, а не доступ.
 *
 * Считает хранилище; здесь — разбор запроса, дерево по признаку и отказы: период не двумя днями
 * или длиннее предела — `400`, дерево не названо или не найдено — `404`.
 */
import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { RequiresRight } from '@rt/message-bus-api/access/util';
import {
    findTreeIdBySlug,
    IUsageAsked,
    IUsageRow,
    IUsageSessionRow,
    readUsage,
    readUsageSessions,
} from '@rt/message-bus-api/observations/data-access';
import { IUsagePeriod, usagePeriodFault, usagePeriodOf, usageTreeOf } from '@rt/message-bus-api/observations/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

@Controller('usage')
export class UsageReadController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /** Строка на скил за период. Пустой период — пустой список, а не отказ. */
    @Get()
    @RequiresRight('usage:read')
    public async usage(@Query() query: Record<string, unknown>): Promise<readonly IUsageRow[]> {
        return readUsage(this.#prisma, await this.#asked(query));
    }

    /** Сессии одного скила за период, свежий день первым. */
    @Get(':skill/sessions')
    @RequiresRight('usage:read')
    public async sessions(@Param('skill') skill: string, @Query() query: Record<string, unknown>): Promise<readonly IUsageSessionRow[]> {
        return readUsageSessions(this.#prisma, await this.#asked(query), skill);
    }

    /** Дерево и период из запроса. Отказы — по порядку чтения: сначала период, потом дерево. */
    async #asked(query: Record<string, unknown>): Promise<IUsageAsked> {
        const fault: string | null = usagePeriodFault(query);

        if (fault) {
            throw new BadRequestException(fault);
        }
        const slug: string = usageTreeOf(query);
        const treeId: string | null = slug ? await findTreeIdBySlug(this.#prisma, slug) : null;

        if (!treeId) {
            throw new NotFoundException('дерево с таким признаком не известно приёмнику');
        }
        const period: IUsagePeriod = usagePeriodOf(query);

        return { treeId, from: period.from, to: period.to };
    }
}
