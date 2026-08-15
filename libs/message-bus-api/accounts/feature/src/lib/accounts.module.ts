import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';

/**
 * Операции входа. Хранилища модуль не подключает: клиент глобальный, и подключает его
 * приложение — цепочка модулей его решение, а не решение домена.
 */
@Module({
    controllers: [AuthController],
})
export class AccountsModule {}
