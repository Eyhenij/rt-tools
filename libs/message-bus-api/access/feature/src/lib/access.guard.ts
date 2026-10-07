/**
 * Проверка доступа приёмника. **Закрыта по умолчанию.**
 *
 * Операция объявляет, чем она закрыта, меткой; необъявленная не отвечает никому. Направление
 * выбрано так, потому что при обратном — списком закрытых операций — забытая строка открывала бы
 * новую операцию наружу молча, а увидеть это можно было бы только по чужому грузу в хранилище.
 *
 * Проверок две, и каждая отвечает за свой способ представиться. Токен Keycloak и право в нём
 * проверяет модуль входа: его проверка стоит рядом и видит то же объявление, потому что каждая
 * метка ставит оба. Здесь остаётся токен дерева. Пропуск операции человека здесь не открывает её:
 * запрос проходит, только если согласны обе проверки.
 *
 * Отказ не называет, что именно не сошлось: ненайденный токен и отозванный отвечают одинаково.
 * Иначе по разнице ответов проверяется, что заведено.
 */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { OPERATION_ACCESS, TOperationAccess } from '@rt/message-bus-api/access/util';
import { ERefusal, refusalBody } from '@rt/message-bus-common';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { findTreeByTokenHash } from '@rt/message-bus-api/trees/data-access';
import { IRequestTree, ITreeBearingRequest, rememberTree, treeTokenHash } from '@rt/message-bus-api/trees/util';
import { TREE_TOKEN_HEADER } from '@rt-tools/agent-kit/cargo';

/** Запрос, каким его видит проверка: заголовки и место под опознанное дерево. */
type TIncomingRequest = ITreeBearingRequest & { headers: Record<string, string | string[] | undefined> };

/**
 * Заголовок одной строкой. Каркас отдаёт повторённый заголовок массивом, и такой запрос токеном
 * не считается вовсе: два токена в одном запросе — не выбор приёмника, какой из них взять.
 */
function headerValue(raw: string | string[] | undefined): string {
    return typeof raw === 'string' ? raw.trim() : '';
}

@Injectable()
export class AccessGuard implements CanActivate {
    readonly #prisma: PrismaService;
    readonly #reflector: Reflector;

    constructor(prisma: PrismaService, reflector: Reflector) {
        this.#prisma = prisma;
        this.#reflector = reflector;
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const access: TOperationAccess | undefined = this.#accessOf(context);
        const request: TIncomingRequest = context.switchToHttp().getRequest<TIncomingRequest>();

        switch (access) {
            case 'public':
            case 'session':
            case 'permission':
                // Токен человека и право в нём проверяет модуль входа
                return true;

            case 'tree':
                rememberTree(request, await this.#treeOf(request));

                return true;

            default:
                // Не объявлено ничего. Это дефект приложения, а не ошибка вызывающего, и
                // отвечать ему нечем: доступ, выведенный за автора, и есть та самая открытая
                // наружу операция, от которой умолчание защищает
                throw new UnauthorizedException(refusalBody(ERefusal.AccessUndeclared));
        }
    }

    /** Метка стоит на самой операции. */
    #accessOf(context: ExecutionContext): TOperationAccess | undefined {
        return this.#reflector.getAllAndOverride<TOperationAccess>(OPERATION_ACCESS, [context.getHandler(), context.getClass()]);
    }

    /**
     * Дерево токена.
     *
     * Отказ хранилища здесь не ловится: недоступную базу разбирает один разбор отказов на всё
     * приложение, и дерево получает от него «повтори прогон», а не «токен не принят».
     */
    async #treeOf(request: TIncomingRequest): Promise<IRequestTree> {
        const token: string = headerValue(request.headers[TREE_TOKEN_HEADER]);

        if (!token) {
            throw new UnauthorizedException(refusalBody(ERefusal.TreeTokenRequired));
        }

        const tree: IRequestTree | null = await findTreeByTokenHash(this.#prisma, treeTokenHash(token));

        if (!tree) {
            throw new UnauthorizedException(refusalBody(ERefusal.TreeTokenRejected));
        }

        return tree;
    }
}
