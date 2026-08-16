/**
 * Клиент хранилища кладёт генератор схемы, и в историю он не едет: пропажу не показывает ни
 * состояние дерева, ни линтер. Собранный без него приёмник разваливается сотней ошибок типов,
 * и настоящая причина тонет в их выводе — поэтому сборка спрашивает про клиента до компиляции.
 *
 * Решение вынесено сюда чистой функцией: конфиг сборки её зовёт, спека проверяет вызовом.
 */

/** Каталог, куда генератор кладёт клиента. Тот же путь стоит в схеме хранилища. */
export const STORAGE_CLIENT_DIR = 'libs/message-bus-api/persistence/util/src/generated/prisma';

/** Входной файл клиента: его зовёт барель либы хранилища. Каталог без него — половина клиента. */
export const STORAGE_CLIENT_ENTRY = `${STORAGE_CLIENT_DIR}/client.ts`;

/** Команда, которой клиент заводится. Стоит в отказе рядом с причиной. */
export const GENERATE_COMMAND = 'pnpm run prisma:generate';

/**
 * Отказ сборки одной строкой — или пусто, когда клиент на месте.
 *
 * @param {(path: string) => boolean} exists — есть ли файл по пути от корня дерева
 * @returns {string | null}
 */
export function storageClientFailure(exists) {
    if (exists(STORAGE_CLIENT_ENTRY)) {
        return null;
    }

    return `сборка приёмника остановлена: нет клиента хранилища в ${STORAGE_CLIENT_DIR} — заведи его командой ${GENERATE_COMMAND}`;
}
