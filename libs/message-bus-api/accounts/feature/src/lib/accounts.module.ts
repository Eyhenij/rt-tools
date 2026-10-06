import { Module } from '@nestjs/common';

import { AccountsAccessController } from './accounts-access.controller';
import { AccountsManageController } from './accounts-manage.controller';
import { AccountsReadController } from './accounts-read.controller';
import { RolesController } from './roles.controller';

/**
 * Чтение и правка людей, роли и доступ человека. Вход сюда не входит: человека опознаёт модуль
 * входа по токену Keycloak. Хранилища модуль не подключает: клиент глобальный, и подключает его
 * приложение.
 */
@Module({
    controllers: [AccountsReadController, AccountsManageController, AccountsAccessController, RolesController],
})
export class AccountsModule {}
