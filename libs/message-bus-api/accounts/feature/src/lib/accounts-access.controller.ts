/**
 * `GET /api/accounts/:name/access` и `PUT /api/accounts/:name/access` — роль и точечные правки
 * одной записи.
 *
 * Закрыты правом на роли, а не правом на правку людей: кто раздаёт права, тот и правит доступ.
 * Отдельным контроллером от правок записи: те закрыты другим правом, и решать про доступ дважды
 * в одном файле незачем.
 *
 * Ответ несёт и исходное — роль и правки, — и то, что из них выходит: сложение одно, в общей
 * либе, и панель показывает его, а не считает своё.
 */
import { BadRequestException, Body, ConflictException, Controller, Get, NotFoundException, Param, Put, Req } from '@nestjs/common';

import { RequiresRight } from '@rt/message-bus-api/access/util';
import {
    findAccountAccess,
    findRoleRef,
    IAccountAccessRow,
    IRoleRef,
    replaceAccountAccess,
} from '@rt/message-bus-api/accounts/data-access';
import {
    accessInputOf,
    accountNameKey,
    accountOf,
    IAccessParse,
    IAccountBearingRequest,
    keepsRolesRight,
    ROLES_RIGHT,
} from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ERefusal, IPermissionEdit, IPersonAccessView, refusalBody, rightsOf } from '@rt/message-bus-common';

/** Последний сегмент адреса: `accounts/<имя>/access`. */
const ACCESS_SEGMENT: string = ':name/access';

/** Ответ о доступе: исходное и сложенное. Строки не из набора складывание отбрасывает само. */
function viewOf(row: IAccountAccessRow): IPersonAccessView {
    return {
        name: row.name,
        role: row.role?.key ?? null,
        edits: row.permissions,
        rights: [...rightsOf(row.role?.rights ?? null, row.permissions)],
    };
}

@Controller('accounts')
export class AccountsAccessController {
    readonly #prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /** Доступ записи по имени: роль, правки и права, которые из них выходят. */
    @Get(ACCESS_SEGMENT)
    @RequiresRight(ROLES_RIGHT)
    public async read(@Param('name') name: string): Promise<IPersonAccessView> {
        return viewOf(await this.#accessNamed(name));
    }

    /**
     * Замена доступа записи целиком: роль и все правки одной транзакцией.
     *
     * Своя запись правится как любая, кроме одного: доступ, после которого у вошедшего не
     * осталось бы права на роли, отбивается словами о самозапирании — раньше записи.
     */
    @Put(ACCESS_SEGMENT)
    @RequiresRight(ROLES_RIGHT)
    public async replace(
        @Param('name') name: string,
        @Body() body: unknown,
        @Req() request: IAccountBearingRequest
    ): Promise<IPersonAccessView> {
        const parsed: IAccessParse = accessInputOf(body);

        if (parsed.fault !== null || parsed.input === null) {
            throw new BadRequestException(refusalBody(parsed.fault?.code ?? ERefusal.EditMalformed, parsed.fault?.params));
        }

        const account: IAccountAccessRow = await this.#accessNamed(name);
        const role: IRoleRef | null = await this.#roleWanted(parsed.input.role);

        this.#refuseLockOut(account, accountOf(request).id, role, parsed.input.edits);
        await replaceAccountAccess(this.#prisma, account.id, role?.id ?? null, parsed.input.edits);

        return viewOf(await this.#accessNamed(name));
    }

    /** Доступ записи по названному имени. Нет такой — «не найдено»: править нечего. */
    async #accessNamed(name: string): Promise<IAccountAccessRow> {
        const found: IAccountAccessRow | null = await findAccountAccess(this.#prisma, { nameKey: accountNameKey(name) });

        if (!found) {
            throw new NotFoundException(refusalBody(ERefusal.AccountNotFound, { name }));
        }

        return found;
    }

    /** Роль по ключу из тела. Пустой ключ — «без роли»; незнакомый — «не найдено». */
    async #roleWanted(key: string | null): Promise<IRoleRef | null> {
        if (key === null) {
            return null;
        }

        const role: IRoleRef | null = await findRoleRef(this.#prisma, key);

        if (!role) {
            throw new NotFoundException(refusalBody(ERefusal.RoleNotFound, { key }));
        }

        return role;
    }

    /** Своя запись без права на роли после правки — отказ раньше записи. Чужая правится как есть. */
    #refuseLockOut(account: IAccountAccessRow, selfId: string, role: IRoleRef | null, edits: readonly IPermissionEdit[]): void {
        if (account.id === selfId && !keepsRolesRight(role?.rights ?? null, edits)) {
            throw new ConflictException(refusalBody(ERefusal.RoleRightsLost));
        }
    }
}
