import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

/** Порт, на котором приёмник слушает, когда настройка его не назвала. */
const DEFAULT_PORT: number = 3000;

async function bootstrap(): Promise<void> {
    const app: INestApplication = await NestFactory.create(AppModule);
    const globalPrefix: string = 'api';
    app.setGlobalPrefix(globalPrefix);

    const port: number = Number(process.env['PORT']) || DEFAULT_PORT;
    await app.listen(port);

    Logger.log(`Приёмник слушает http://localhost:${port}/${globalPrefix}`);
}

void bootstrap();
