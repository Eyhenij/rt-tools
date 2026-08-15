import { Module } from '@nestjs/common';

import { PostmortemsIntakeController } from './postmortems-intake.controller';
import { PostmortemsReadController } from './postmortems-read.controller';

/**
 * Разборы происшествий дерева: опознаются именем файла, приехавший повторно обновляет прежний.
 *
 * Записью месяца домен не владеет и своим запросом её не заводит — он зовёт домен наблюдений,
 * которому она принадлежит.
 *
 * Операций у домена две пары: приём закрыт токеном дерева, чтение — входом человека. Разведены
 * они по контроллерам, а не по меткам внутри одного: два способа представиться в одном файле
 * читались бы как одна поверхность с двумя дверьми.
 */
@Module({
    controllers: [PostmortemsIntakeController, PostmortemsReadController],
})
export class PostmortemsModule {}
