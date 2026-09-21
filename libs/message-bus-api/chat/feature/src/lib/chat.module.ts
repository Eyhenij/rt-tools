import { Module } from '@nestjs/common';

import { AccessModule } from '@rt/message-bus-api/access/feature';

import { ChatIntakeController } from './chat-intake.controller';
import { ChatReadController } from './chat-read.controller';
import { ChatSubscribersService } from './chat-subscribers.service';

/**
 * Чат с посетителями сайтов: приём первой реплики и заведение переписки.
 *
 * Операции домена открыты и сторожатся ключом сайта, списком его адресов и пределом частоты:
 * посетитель пишет без входа, и представиться ему нечем. Учётные записи и права приёмника домен
 * не читает вовсе — у чата свои пространства и свои операторы.
 *
 * Операций у домена две семьи, и разведены они по контроллерам: приём реплики посетителя открыт
 * и закрыт ключом сайта, чтение оператором закрыто входом человека. Два способа представиться в
 * одном файле читались бы как одна поверхность с двумя дверьми.
 */
@Module({
    imports: [AccessModule],
    controllers: [ChatIntakeController, ChatReadController],
    providers: [ChatSubscribersService],
})
export class ChatModule {}
