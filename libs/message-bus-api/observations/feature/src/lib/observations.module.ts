import { Module } from '@nestjs/common';

import { ObservationRetentionService } from './observation-retention.service';
import { ObservationsIntakeController } from './observations-intake.controller';
import { SummariesReadController } from './summaries-read.controller';
import { SummaryIntakeController } from './summary-intake.controller';
import { UsageReadController } from './usage-read.controller';

/**
 * Наблюдения дерева: сводка последнего прогона с записью месяца, которую она заводит, и строки
 * наблюдений по дням.
 *
 * Клиент хранилища домен не объявляет — он виден всем доменам приёмника, потому что соединение
 * одно на приложение. Наружу модуль ничего не отдаёт.
 *
 * Операций у домена две пары: приём закрыт токеном дерева, чтение — входом человека. Разведены
 * они по контроллерам, а не по меткам внутри одного: два способа представиться в одном файле
 * читались бы как одна поверхность с двумя дверьми.
 */
@Module({
    controllers: [SummaryIntakeController, ObservationsIntakeController, SummariesReadController, UsageReadController],
    providers: [ObservationRetentionService],
})
export class ObservationsModule {}
