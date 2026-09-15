import { Module } from '@nestjs/common';

import { AccountsAccessController } from './accounts-access.controller';
import { AccountsManageController } from './accounts-manage.controller';
import { AccountsReadController } from './accounts-read.controller';
import { AccountStartupService } from './account-startup.service';
import { AuthController } from './auth.controller';
import { LoginAttemptsService } from './login-attempts.service';
import { RolesController } from './roles.controller';

/**
 * Операции входа, чтение и правка людей, роли и доступ человека, и то, что служба говорит об
 * учётных записях при подъёме. Хранилища модуль не подключает: клиент глобальный, и подключает его приложение — цепочка модулей его решение, а не
 * решение домена.
 *
 * Состав команд этот модуль не берёт: там нет ни порта, ни входа, и говорить о записях при
 * запуске `account:list` было бы нечем — она о них и говорит.
 */
@Module({
    controllers: [AuthController, AccountsReadController, AccountsManageController, AccountsAccessController, RolesController],
    providers: [AccountStartupService, LoginAttemptsService],
})
export class AccountsModule {}
