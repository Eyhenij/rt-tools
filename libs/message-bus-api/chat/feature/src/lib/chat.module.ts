import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AccessModule } from '@rt/message-bus-api/access/feature';

import { ChatCorsMiddleware } from './chat-cors.middleware';
import { ChatEmbeddedController } from './chat-embedded.controller';
import { ChatHookService } from './chat-hook.service';
import { ChatIntakeController } from './chat-intake.controller';
import { ChatReadController } from './chat-read.controller';
import { ChatSubscribersService } from './chat-subscribers.service';
import { ChatTalkService } from './chat-talk.service';
import { ChatWakeService } from './chat-wake.service';

/**
 * Чат с посетителями сайтов: приём первой реплики и заведение переписки.
 *
 * Операции домена открыты и сторожатся ключом сайта, списком его адресов и пределом частоты:
 * посетитель пишет без входа, и представиться ему нечем. Учётные записи и права приёмника домен
 * не читает вовсе — у чата свои пространства и свои операторы.
 *
 * Операций у домена три семьи, и разведены они по контроллерам: приём реплики посетителя открыт
 * и закрыт ключом сайта, чтение оператором закрыто входом человека, встраиваемая страница —
 * подписью потребителя. Разные способы представиться в одном файле читались бы как одна
 * поверхность с несколькими дверьми.
 */
/**
 * Пути открытых операций: на них браузер чужой страницы получает позволение обращаться.
 *
 * Пути названы поимённо, а не образцом: позволение даётся ровно открытым операциям, и чтение
 * оператором, закрытое входом человека, к этому списку отношения не имеет.
 */
const OPEN_PATHS: readonly string[] = [
    'chat/conversations',
    'chat/site',
    'chat/messages',
    'chat/stream',
    'chat/embedded/entry',
    'chat/embedded/conversations',
    'chat/embedded/conversations/:id/messages',
    'chat/embedded/conversations/:id/state',
];

@Module({
    imports: [AccessModule],
    controllers: [ChatIntakeController, ChatReadController, ChatEmbeddedController],
    providers: [ChatSubscribersService, ChatHookService, ChatWakeService, ChatTalkService],
})
export class ChatModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): void {
        consumer.apply(ChatCorsMiddleware).forRoutes(...OPEN_PATHS);
    }
}
