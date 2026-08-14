import { Module } from '@nestjs/common';

import { SummaryIntakeController } from './summary-intake.controller';

/**
 * Наблюдения дерева: сводка последнего прогона и запись месяца, которую она заводит.
 *
 * Клиент хранилища домен не объявляет — он виден всем доменам приёмника, потому что соединение
 * одно на приложение. Наружу модуль ничего не отдаёт: у домена одна поверхность — операция приёма.
 */
@Module({
    controllers: [SummaryIntakeController],
})
export class ObservationsModule {}
