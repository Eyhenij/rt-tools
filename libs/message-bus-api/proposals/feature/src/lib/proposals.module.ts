import { Module } from '@nestjs/common';

import { ProposalsIntakeController } from './proposals-intake.controller';
import { ProposalsReadController } from './proposals-read.controller';

/**
 * Предложения дерева по слою правил: копятся к записи месяца, отбираются по тексту.
 *
 * Запись месяца домен не заводит своим запросом — он зовёт домен наблюдений, которому она
 * принадлежит: второй upsert той же пары «дерево — месяц» разошёлся бы с первым при первой правке.
 *
 * Операций у домена две пары: приём закрыт токеном дерева, чтение — входом человека. Разведены
 * они по контроллерам, а не по меткам внутри одного: два способа представиться в одном файле
 * читались бы как одна поверхность с двумя дверьми.
 */
@Module({
    controllers: [ProposalsIntakeController, ProposalsReadController],
})
export class ProposalsModule {}
