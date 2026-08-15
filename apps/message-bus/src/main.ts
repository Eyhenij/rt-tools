/**
 * Вход приёмника. Без доводов он поднимает службу, с доводом — исполняет команду деревьев или
 * учётных записей и выходит.
 *
 * Одна точка входа на оба случая потому, что образ у приёмника один: `node main.js` поднимает
 * службу, `node main.js tree:list` спрашивает её же хранилище. Вторая сборка под команды
 * означала бы второй образ, который расходится с первым молча.
 */
import { createInterface, Interface } from 'node:readline/promises';

import { INestApplicationContext, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AccountCommandsService, IAccountCommandReport } from '@rt/message-bus-api/accounts/feature';
import { isAccountCommand } from '@rt/message-bus-api/accounts/util';
import { TreeCommandsService } from '@rt/message-bus-api/trees/feature';
import { ITreeCommandReport } from '@rt/message-bus-api/trees/util';

import { AppModule } from './app/app.module';
import { cargoLimit } from './app/cargo-limit';
import { CommandsModule } from './app/commands.module';

/** Порт, на котором приёмник слушает, когда настройка его не назвала. */
const DEFAULT_PORT: number = 3000;

/** Код выхода, которым команда говорит об отказе. */
const EXIT_REFUSED: number = 1;

async function serve(): Promise<void> {
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

/**
 * Пароль спрашивается здесь, а не приходит доводом: строка запуска остаётся и в истории оболочки,
 * и в списке процессов машины, и пароль, написанный доводом, виден там обоим.
 *
 * Эхо ввода не гасится: терминал контейнера отдаётся не всегда, а команда, молча не принимающая
 * ввод, выглядит зависшей. Пароль при этом виден в окне того, кто его вводит, и больше нигде.
 */
async function askPassword(question: string): Promise<string> {
    const input: Interface = createInterface({ input: process.stdin, output: process.stderr });

    try {
        return (await input.question(question)).trim();
    } finally {
        input.close();
    }
}

/**
 * Команда деревьев.
 *
 * Каркас говорит здесь только о поломках: сводка о поднятых модулях затолкала бы напечатанный
 * один раз токен в середину вывода, откуда его выбирают глазами. Печатается вывод команды
 * прямо в поток, а не строкой лога, — логи уезжают в сборщик, и токену там не место.
 */
async function runCommand(argv: readonly string[]): Promise<void> {
    const context: INestApplicationContext = await NestFactory.createApplicationContext(CommandsModule, {
        logger: ['warn', 'error'],
    });

    try {
        const report: ITreeCommandReport | IAccountCommandReport = isAccountCommand(argv[0] ?? '')
            ? await context.get(AccountCommandsService).run(argv, askPassword)
            : await context.get(TreeCommandsService).run(argv);

        process.stdout.write(`${report.lines.join('\n')}\n`);
        process.exitCode = report.failed ? EXIT_REFUSED : 0;
    } finally {
        await context.close();
    }
}

async function bootstrap(): Promise<void> {
    const argv: readonly string[] = process.argv.slice(2);

    await (argv.length ? runCommand(argv) : serve());
}

void bootstrap();
