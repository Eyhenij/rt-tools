import { Module } from '@nestjs/common';

import { CargoStateController } from './cargo-state.controller';

/**
 * Состояние груза: путь записи, которым дерево двигает свои разборы и предложения.
 *
 * Домен заведён отдельно от обоих родов груза потому, что пакет правки везёт их разом, а домену
 * одного рода не видно либ другого. Своего хранилища у него нет: таблицу правит тот домен, чья
 * она, — этот зовёт обе записи и собирает ответ.
 */
@Module({
    controllers: [CargoStateController],
})
export class CargoStateModule {}
