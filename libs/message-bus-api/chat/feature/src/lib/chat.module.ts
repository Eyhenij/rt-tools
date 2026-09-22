import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AccessModule } from '@rt/message-bus-api/access/feature';

import { ChatCorsMiddleware } from './chat-cors.middleware';
import { ChatHookService } from './chat-hook.service';
import { ChatIntakeController } from './chat-intake.controller';
import { ChatReadController } from './chat-read.controller';
import { ChatSubscribersService } from './chat-subscribers.service';
import { ChatWakeService } from './chat-wake.service';

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
/**
 * Пути открытых операций: на них браузер чужой страницы получает позволение обращаться.
 *
 * Пути названы поимённо, а не образцом: позволение даётся ровно открытым операциям, и чтение
 * оператором, закрытое входом человека, к этому списку отношения не имеет.
 */
const OPEN_PATHS: readonly string[] = ['chat/conversations', 'chat/site', 'chat/messages', 'chat/stream'];

@Module({
    imports: [AccessModule],
    controllers: [ChatIntakeController, ChatReadController],
    providers: [ChatSubscribersService, ChatHookService, ChatWakeService],
})
export class ChatModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): void {
        consumer.apply(ChatCorsMiddleware).forRoutes(...OPEN_PATHS);
    }
}
