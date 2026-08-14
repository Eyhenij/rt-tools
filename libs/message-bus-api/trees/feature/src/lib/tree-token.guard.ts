/**
 * Проверка токена дерева. **Закрыта по умолчанию.**
 *
 * Приёмник ничего не отдаёт без токена: открытых операций у него нет вовсе, кроме пробы
 * живости, и та объявляет себя меткой `@Public()`. Направление выбрано так, потому что при
 * обратном — списком закрытых операций — забытая строка открывала бы новую операцию приёма
 * наружу молча, а увидеть это можно было бы только по чужому грузу в хранилище.
 *
 * Отказ не называет, что именно не сошлось: ненайденный токен и отозванный отвечают одинаково.
 * Иначе по разнице ответов проверяется, заведён ли токен вообще.
 */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { findTreeByTokenHash } from '@rt/message-bus-api/trees/data-access';
import { IRequestTree, ITreeBearingRequest, rememberTree, treeTokenHash } from '@rt/message-bus-api/trees/util';
import { TREE_TOKEN_HEADER } from '@rt-tools/agent-kit/cargo';

import { PUBLIC_OPERATION } from './public.decorator';

/** Запрос, каким его видит проверка: заголовки и место под опознанное дерево. */
type TIncomingRequest = ITreeBearingRequest & { headers: Record<string, string | string[] | undefined> };

/**
 * Заголовок одной строкой. Каркас отдаёт повторённый заголовок массивом, и такой запрос
 * токеном не считается вовсе: два токена в одном запросе — не выбор приёмника, какой из них
 * взять.
 */
function headerValue(raw: string | string[] | undefined): string {
    return typeof raw === 'string' ? raw.trim() : '';
}

@Injectable()
export class TreeTokenGuard implements CanActivate {
    readonly #prisma: PrismaService;
    readonly #reflector: Reflector;

    constructor(prisma: PrismaService, reflector: Reflector) {
        this.#prisma = prisma;
        this.#reflector = reflector;
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.#isPublic(context)) {
            return true;
        }

        const request: TIncomingRequest = context.switchToHttp().getRequest<TIncomingRequest>();
        const token: string = headerValue(request.headers[TREE_TOKEN_HEADER]);

        if (!token) {
            throw new UnauthorizedException('операция требует токен дерева');
        }

        rememberTree(request, await this.#treeOfToken(token));

        return true;
    }

    /** Метка стоит либо на самой операции, либо на всём контроллере — читаются оба места. */
    #isPublic(context: ExecutionContext): boolean {
        return this.#reflector.getAllAndOverride<boolean>(PUBLIC_OPERATION, [context.getHandler(), context.getClass()]) === true;
    }

    /**
     * Дерево токена.
     *
     * Отказ хранилища здесь не ловится: недоступную базу разбирает один разбор отказов на всё
     * приложение, и дерево получает от него «повтори прогон», а не «токен не принят». Поймай его
     * проверка — приёмник отвечал бы на упавшую базу так же, как на чужой токен.
     */
    async #treeOfToken(token: string): Promise<IRequestTree> {
        const tree: IRequestTree | null = await findTreeByTokenHash(this.#prisma, treeTokenHash(token));

        if (!tree) {
            throw new UnauthorizedException('токен не принят');
        }

        return tree;
    }
}
