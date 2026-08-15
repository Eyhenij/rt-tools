import { Module } from '@nestjs/common';

import { SummariesReadController } from './summaries-read.controller';
import { SummaryIntakeController } from './summary-intake.controller';

/**
 * Наблюдения дерева: сводка последнего прогона и запись месяца, которую она заводит.
 *
 * Клиент хранилища домен не объявляет — он виден всем доменам приёмника, потому что соединение
 * одно на приложение. Наружу модуль ничего не отдаёт.
 *
 * Операций у домена две пары: приём закрыт токеном дерева, чтение — входом человека. Разведены
 * они по контроллерам, а не по меткам внутри одного: два способа представиться в одном файле
 * читались бы как одна поверхность с двумя дверьми.
 */
@Module({
    controllers: [SummaryIntakeController, SummariesReadController],
})
export class ObservationsModule {}
