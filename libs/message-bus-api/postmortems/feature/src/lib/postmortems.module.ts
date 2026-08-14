import { Module } from '@nestjs/common';

import { PostmortemsIntakeController } from './postmortems-intake.controller';

/**
 * Разборы происшествий дерева: опознаются именем файла, приехавший повторно обновляет прежний.
 *
 * Записью месяца домен не владеет и своим запросом её не заводит — он зовёт домен наблюдений,
 * которому она принадлежит.
 */
@Module({
    controllers: [PostmortemsIntakeController],
})
export class PostmortemsModule {}
