/**
 * Единственная проверка доступа приёмника. **Закрыта по умолчанию.**
 *
 * Операция объявляет, чем она закрыта, меткой; необъявленная не отвечает никому. Направление
 * выбрано так, потому что при обратном — списком закрытых операций — забытая строка открывала бы
 * новую операцию наружу молча, а увидеть это можно было бы только по чужому грузу в хранилище.
 *
 * Проверка одна на оба способа представиться намеренно: две глобальные проверки подряд означали
 * бы, что запрос с токеном дерева доходит до чтения груза, если вторая забыла отказать. Здесь
 * способ выбирается объявлением, и второго пути к операции нет.
 *
 * Отказ не называет, что именно не сошлось: ненайденный токен, отозванный, просроченный вход и
 * отключённая запись отвечают одинаково. Иначе по разнице ответов проверяется, что заведено.
 *
 * Отказов при этом два, а не один, и разводятся они по вопросу, а не по подробности: «ты не
 * представился» лечится входом, «тебе это не положено» входом не лечится. Какого именно права не
 * хватило, второй отказ тоже не называет — по разнице ответов иначе читается набор прав чужой
 * записи, по запросу за раз.
 */
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
    findAccountRights,
    findSessionByHash,
    IAccountRights,
    ISessionForRequest,
    requestAccountOf,
} from '@rt/message-bus-api/accounts/data-access';
import {
    IAccountBearingRequest,
    rememberAccount,
    sessionAlive,
    sessionCookieOf,
    sessionTokenHash,
} from '@rt/message-bus-api/accounts/util';
import { hasRight, OPERATION_ACCESS, OPERATION_RIGHT, rightsOf, TOperationAccess, TRight } from '@rt/message-bus-api/access/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { findTreeByTokenHash } from '@rt/message-bus-api/trees/data-access';
import { IRequestTree, ITreeBearingRequest, rememberTree, treeTokenHash } from '@rt/message-bus-api/trees/util';
import { TREE_TOKEN_HEADER } from '@rt-tools/agent-kit/cargo';

/** Запрос, каким его видит проверка: заголовки, куки и место под опознанного. */
type TIncomingRequest = ITreeBearingRequest & IAccountBearingRequest & { headers: Record<string, string | string[] | undefined> };

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
                return true;

            case 'tree':
                rememberTree(request, await this.#treeOf(request));

                return true;

            case 'session':
                rememberAccount(request, requestAccountOf(await this.#sessionOf(request)));

                return true;

            case 'permission':
                return this.#byRight(context, request);

            default:
                // Не объявлено ничего. Это дефект приложения, а не ошибка вызывающего, и
                // отвечать ему нечем: доступ, выведенный за автора, и есть та самая открытая
                // наружу операция, от которой умолчание защищает
                throw new UnauthorizedException('операция доступа не объявила');
        }
    }

    /** Метка стоит либо на самой операции, либо на всём контроллере — читаются оба места. */
    #accessOf(context: ExecutionContext): TOperationAccess | undefined {
        return this.#reflector.getAllAndOverride<TOperationAccess>(OPERATION_ACCESS, [context.getHandler(), context.getClass()]);
    }

    /** Право операции — оттуда же, откуда и вид доступа. */
    #rightOf(context: ExecutionContext): TRight | undefined {
        return this.#reflector.getAllAndOverride<TRight>(OPERATION_RIGHT, [context.getHandler(), context.getClass()]);
    }

    /**
     * Операция, закрытая правом: сначала вход, потом право.
     *
     * Права читаются здесь, а не берутся из входа: вход живёт часами, и снятое право иначе
     * держало бы раздел открытым до конца дня.
     *
     * Роли у записи нет — прав нет ни одного, и это не поломка: человек вошёл, а раздела не
     * видит. Правом, о котором роль молчит, операция не открывается: молчание — не разрешение.
     */
    async #byRight(context: ExecutionContext, request: TIncomingRequest): Promise<boolean> {
        const right: TRight | undefined = this.#rightOf(context);

        if (!right) {
            // Вид доступа объявлен, а право рядом не названо. Это дефект приложения, и отвечать
            // вызывающему нечем: операция, открытая по недописанному объявлению, и есть та самая
            // дыра, от которой умолчание «закрыто» защищает
            throw new UnauthorizedException('операция доступа не объявила');
        }

        const session: ISessionForRequest = await this.#sessionOf(request);

        rememberAccount(request, requestAccountOf(session));

        const rights: IAccountRights | null = await findAccountRights(this.#prisma, session.account.id);

        if (!rights || !hasRight(rightsOf(rights.roleRights, rights.edits), right)) {
            throw new ForbiddenException('операция требует права');
        }

        return true;
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
            throw new UnauthorizedException('операция требует токен дерева');
        }

        const tree: IRequestTree | null = await findTreeByTokenHash(this.#prisma, treeTokenHash(token));

        if (!tree) {
            throw new UnauthorizedException('токен не принят');
        }

        return tree;
    }

    /**
     * Вход, которым пришли.
     *
     * Токен дерева здесь не принимается вовсе, даже годный: он открывает приём своего дерева, а
     * не чтение груза всех.
     */
    async #sessionOf(request: TIncomingRequest): Promise<ISessionForRequest> {
        const carried: string = sessionCookieOf(request.headers['cookie']);

        if (!carried) {
            throw new UnauthorizedException('операция требует входа');
        }

        const session: ISessionForRequest | null = await findSessionByHash(this.#prisma, sessionTokenHash(carried));

        if (!session || !sessionAlive(session, new Date()) || session.account.disabledAt !== null) {
            throw new UnauthorizedException('операция требует входа');
        }

        return session;
    }
}
