/**
 * `/api/roles` — роли приёмника: страница, одна роль, заведение, правка и удаление.
 *
 * Всё закрыто одним правом на роли — и чтение тоже: список ролей говорит, что каждая из них
 * открывает, а кто это читает, тот и правит. Право на правку людей сюда не ведёт: иначе тот, кто
 * заведует записями, мог бы выдать себе любое право.
 *
 * Отказы говорят словами про действие человека — занятое имя, право не из набора, роль, которую
 * держат, — и слово уходит в панель как есть. Правка своей роли, которая оставила бы вошедшего
 * без права на роли, отбивается раньше записи: следующий же его переход кончался бы отказом той
 * самой страницы, на которой он стоит.
 */
import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Delete,
    Get,
    HttpCode,
    Logger,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    Req,
} from '@nestjs/common';

import { RequiresRight } from '@rt/message-bus-api/access/util';
import {
    createRole,
    deleteRole,
    findAccountAccess,
    findRoleByKey,
    IAccountAccessRow,
    IRoleName,
    listRoleNames,
    readRoles,
    updateRole,
} from '@rt/message-bus-api/accounts/data-access';
import {
    accountNameKey,
    accountOf,
    IAccountBearingRequest,
    IRoleParse,
    keepsRolesRight,
    roleInputOf,
    ROLES_RIGHT,
} from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPage, IRoleView, pageAsked, pageFault, ROLE_SORTABLE } from '@rt/message-bus-common';

@Controller('roles')
export class RolesController {
    readonly #prisma: PrismaService;
    readonly #log: Logger = new Logger(RolesController.name);

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /** Страница ролей: ключ, имя, права и сколько людей держат роль. Порядок один — по имени. */
    @Get()
    @RequiresRight(ROLES_RIGHT)
    public async page(@Query() query: Record<string, unknown>): Promise<IPage<IRoleView>> {
        const fault: string | null = pageFault(query, ROLE_SORTABLE);

        if (fault) {
            throw new BadRequestException(fault);
        }

        return readRoles(this.#prisma, pageAsked(query, ROLE_SORTABLE));
    }

    /** Одна роль по ключу: её читает панель, открытая по адресу, — не из списка. */
    @Get(':key')
    @RequiresRight(ROLES_RIGHT)
    public async one(@Param('key') key: string): Promise<IRoleView> {
        return this.#roleNamed(key);
    }

    /**
     * Заведение роли по имени и правам.
     *
     * Ключ выводится из имени один раз — приведённым видом, тем же, каким приводится имя записи, —
     * и дальше не меняется: им на роль ссылаются адрес панели и засев. Занятое имя отбивается
     * по приведённому виду: две роли, разные одной буквой, читаются человеком как одна.
     */
    @Post()
    @RequiresRight(ROLES_RIGHT)
    public async create(@Body() body: unknown): Promise<IRoleView> {
        const parsed: IRoleParse = roleInputOf(body);

        if (parsed.fault !== null || parsed.input === null) {
            throw new BadRequestException(parsed.fault?.said ?? 'роль ждёт имя');
        }

        const key: string = accountNameKey(parsed.input.name);

        await this.#refuseTakenName(parsed.input.name, null);

        if (await findRoleByKey(this.#prisma, key)) {
            throw new ConflictException(`роль «${parsed.input.name}» уже заведена: имя занято`);
        }

        await createRole(this.#prisma, key, parsed.input);
        this.#log.log({ key, event: 'role-created', rights: parsed.input.rights.length });

        return this.#roleNamed(key);
    }

    /**
     * Имя и права роли целиком.
     *
     * Своя роль правится как любая, кроме одного: правка, после которой у вошедшего не осталось
     * бы права на роли, отбивается словами о самозапирании. Правки других записей поверх этой
     * роли в расчёт не берутся: запираться могут только они сами, и это их право.
     */
    @Put(':key')
    @RequiresRight(ROLES_RIGHT)
    public async replace(@Param('key') key: string, @Body() body: unknown, @Req() request: IAccountBearingRequest): Promise<IRoleView> {
        const parsed: IRoleParse = roleInputOf(body);

        if (parsed.fault !== null || parsed.input === null) {
            throw new BadRequestException(parsed.fault?.said ?? 'роль ждёт имя');
        }

        await this.#roleNamed(key);
        await this.#refuseTakenName(parsed.input.name, key);

        const self: IAccountAccessRow | null = await findAccountAccess(this.#prisma, { id: accountOf(request).id });

        if (self?.role?.key === key && !keepsRolesRight(parsed.input.rights, self.permissions)) {
            throw new ConflictException('правка оставила бы вас без права на роли: сначала дайте его другой записи');
        }

        await updateRole(this.#prisma, key, parsed.input);
        this.#log.log({ key, event: 'role-replaced', rights: parsed.input.rights.length });

        return this.#roleNamed(key);
    }

    /**
     * Удаление роли, которую никто не держит.
     *
     * Держат — отказ с числом: хранилище сняло бы роль с записей молча, и люди остались бы без
     * прав, не узнав об этом. Ответа нет: показывать после удаления нечего, список перечитывается.
     */
    @Delete(':key')
    @HttpCode(204)
    @RequiresRight(ROLES_RIGHT)
    public async remove(@Param('key') key: string): Promise<void> {
        const role: IRoleView = await this.#roleNamed(key);

        if (role.people > 0) {
            throw new ConflictException(`роль «${role.name}» держат записи: ${role.people}; сначала дайте им другую`);
        }

        await deleteRole(this.#prisma, key);
        this.#log.log({ event: 'role-deleted', key });
    }

    /** Роль по ключу. Нет такой — «не найдено»: править нечего. */
    async #roleNamed(key: string): Promise<IRoleView> {
        const role: IRoleView | null = await findRoleByKey(this.#prisma, key);

        if (!role) {
            throw new NotFoundException(`роли с ключом «${key}» нет`);
        }

        return role;
    }

    /**
     * Занято ли имя другой ролью — по приведённому виду. Своя роль при переименовании в расчёт
     * не берётся: имя, оставленное как было, не занято.
     */
    async #refuseTakenName(name: string, ownKey: string | null): Promise<void> {
        const wanted: string = accountNameKey(name);
        const roles: readonly IRoleName[] = await listRoleNames(this.#prisma);
        const taken: IRoleName | undefined = roles.find(
            (role: IRoleName): boolean => role.key !== ownKey && accountNameKey(role.name) === wanted
        );

        if (taken) {
            throw new ConflictException(`роль «${taken.name}» уже заведена: имя занято`);
        }
    }
}
