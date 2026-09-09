import { Module } from '@nestjs/common';

import { CargoCloseController } from './cargo-close.controller';
import { CargoStateController } from './cargo-state.controller';
import { CargoVersionsController } from './cargo-versions.controller';
import { OwnCargoReadController } from './own-cargo-read.controller';

/**
 * Состояние груза: путь записи, которым дерево двигает свои разборы и предложения.
 *
 * Домен заведён отдельно от обоих родов груза потому, что пакет правки везёт их разом, а домену
 * одного рода не видно либ другого. Своего хранилища у него нет: таблицу правит тот домен, чья
 * она, — этот зовёт обе записи и собирает ответ.
 *
 * Тем же приёмом здесь стоит чтение встретившихся версий выпуска: род груза оно принимает
 * параметром, и оба рода ему нужны разом. Рядом — чтение своих записей деревом: оно тоже берёт
 * оба рода и закрыто токеном, а не входом человека.
 *
 * Операций правки состояния две, и они не заменяют друг друга: свою запись двигает приславшее её
 * дерево токеном, а закрывает — издатель редакции под входом человека. Стоят рядом потому, что
 * правят одну колонку и делят разбор пакета: разъехавшись по доменам, они разошлись бы и в том,
 * что считают годной строкой.
 */
@Module({
    controllers: [CargoStateController, CargoCloseController, CargoVersionsController, OwnCargoReadController],
})
export class CargoStateModule {}
