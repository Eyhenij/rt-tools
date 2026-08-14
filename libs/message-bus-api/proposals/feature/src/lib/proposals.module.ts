import { Module } from '@nestjs/common';

import { ProposalsIntakeController } from './proposals-intake.controller';

/**
 * Предложения дерева по слою правил: копятся к записи месяца, отбираются по тексту.
 *
 * Запись месяца домен не заводит своим запросом — он зовёт домен наблюдений, которому она
 * принадлежит: второй upsert той же пары «дерево — месяц» разошёлся бы с первым при первой правке.
 */
@Module({
    controllers: [ProposalsIntakeController],
})
export class ProposalsModule {}
