/**
 * The entry of the example server: the records of the example admin behind the token check.
 */
import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { ExampleApiModule } from './app/example-api.module';

/** The port the example listens on when the environment names none. */
const EXAMPLE_PORT: number = 3210;

async function serve(): Promise<void> {
    const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(ExampleApiModule);
    app.setGlobalPrefix('api');
    app.disable('x-powered-by');

    const port: number = Number(process.env['PORT']) || EXAMPLE_PORT;
    await app.listen(port);
    Logger.log(`the example server listens on ${port}`, 'Bootstrap');
}

serve().catch((error: unknown): void => {
    Logger.error(error, 'Bootstrap');
    process.exit(1);
});
