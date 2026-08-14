import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app/app.module';
import { cargoLimit } from './app/cargo-limit';

/** Порт, на котором приёмник слушает, когда настройка его не назвала. */
const DEFAULT_PORT: number = 3000;

async function bootstrap(): Promise<void> {
    const limit: string = cargoLimit();
    const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule);

    app.setGlobalPrefix('api');
    app.useBodyParser('json', { limit });

    // Каркас отдачи называет себя заголовком ответа. Проба живости открыта без токена, и всё
    // сверх «поднята» — подсказка тому, кто ищет вход.
    app.disable('x-powered-by');

    const port: number = Number(process.env['PORT']) || DEFAULT_PORT;
    await app.listen(port);

    Logger.log(`приёмник поднят: порт ${port}, предел веса груза ${limit}`, 'Bootstrap');
}

void bootstrap();
