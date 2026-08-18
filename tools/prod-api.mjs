#!/usr/bin/env node
/**
 * Команды приёмника на проде.
 *
 * Заведение дерева, выдача токена, список деревьев и учётные записи зовутся одной и той же
 * длинной строкой: ssh, каталог выкатки, состав прода с файлом окружения, служба и точка входа
 * образа. Собранная по памяти, она отказывает — перенос внутри одинарных кавычек разрывает её
 * надвое, и удалённая оболочка получает два куска вместо команды.
 *
 *   pnpm run prod:api tree:list
 *   pnpm run prod:api tree:add 'Имя дерева' a1b2c3d4e5f6
 *
 * Доводы уходят на прод как есть: разбор написан в самом приёмнике, и второй разбор здесь
 * означал бы два ответа на вопрос, что за довод пришёл. Незнакомый довод приёмник встречает
 * перечнем своих команд — поэтому перечня здесь нет тоже.
 *
 * Без доводов команда не зовётся вовсе: пустой довод у точки входа образа означает не перечень,
 * а поднятую службу — рядом с той, что уже работает.
 */
import { spawnSync } from 'node:child_process';

/** Узел прода — имя из настроек ssh; каталог выкатки и состав описаны в `docs/PROD.md`. */
const HOST = 'message-bus';
const DIRECTORY = '/opt/message-bus';
const COMPOSE = 'docker compose -f docker-compose.prod.yml --env-file .env.prod';

/** Служба приёмника в составе прода и точка входа её образа. */
const SERVICE = 'api';
const ENTRY = 'node main.js';

/** Код выхода при отказе разбора: тот же, каким отвечает сам приёмник на негодный довод. */
const EXIT_REFUSED = 2;

/**
 * Довод в виде, который не разберёт удалённая оболочка: строка целиком уезжает одним словом.
 * Одинарная кавычка внутри закрывает строку, вставляет экранированную и открывает снова.
 */
function quoted(argument) {
    return `'${String(argument).replace(/'/g, `'\\''`)}'`;
}

function main() {
    const argv = process.argv.slice(2);

    if (argv.length === 0) {
        process.stderr.write(
            ['prod-api: нужен довод — команда приёмника', 'перечень печатает сам приёмник: pnpm run prod:api help', ''].join('\n')
        );
        process.exit(EXIT_REFUSED);
    }

    const remote = `cd ${DIRECTORY} && ${COMPOSE} exec -T ${SERVICE} ${ENTRY} ${argv.map(quoted).join(' ')}`;
    const answer = spawnSync('ssh', [HOST, remote], { stdio: 'inherit' });

    if (answer.error) {
        process.stderr.write(`prod-api: до узла ${HOST} не дозвониться — ${answer.error.message}\n`);
        process.exit(EXIT_REFUSED);
    }

    // Отказом кончаются два разных случая: приёмник не принял довод и приёмника нет вовсе —
    // `exec` идти некуда. Первый виден по напечатанному выше, второй не виден ничем, поэтому
    // строка называет, чем его отличить, и причины не утверждает. Разовый контейнер здесь не
    // зовётся: он поднимает за собой базу и накат миграций, а это уже частичная выкатка.
    if (answer.status !== 0) {
        process.stderr.write(
            [
                '',
                'выше — ответ приёмника; если ответа нет вовсе, состояние служб покажет:',
                `  ssh ${HOST} 'cd ${DIRECTORY} && ${COMPOSE} ps'`,
                '',
            ].join('\n')
        );
    }

    process.exit(answer.status ?? EXIT_REFUSED);
}

main();
