import { Module } from '@nestjs/common';

import { AccountCommandsModule } from '@rt/message-bus-api/accounts/feature';
import { PrismaModule } from '@rt/message-bus-api/persistence/feature';
import { TreeCommandsModule } from '@rt/message-bus-api/trees/feature';

/**
 * Состав приёмника, когда он поднят командой, а не службой.
 *
 * Каркаса отдачи здесь нет: команды ходят к хранилищу напрямую, порт не слушают и проверку
 * токена не поднимают — токен дерева ни одной из них не открывает. Поднимать ради `tree:list`
 * весь состав службы значило бы держать открытый порт на время печати списка.
 */
@Module({
    imports: [PrismaModule, TreeCommandsModule, AccountCommandsModule],
})
export class CommandsModule {}
