/**
 * Отправка груза в приём: единственное место пакета, которое ходит в сеть.
 *
 * Ходит оно только по команде человека — ни один гард в сеть не ходит вовсе. Вынесено отдельно,
 * чтобы сборка груза осталась проверяемой: спека подставляет двойник и никуда не стучится.
 *
 * Груз уезжает в закрытый приём, а не в открытую очередь работ: сводка говорит о рабочих
 * привычках команды — чем пользуются, обо что спотыкаются, сколько раз признавали промах, — и в
 * открытой очереди это выложено всему свету.
 */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, join } from 'node:path';

import { IIntakeAccepted, TREE_TOKEN_HEADER } from './cargo.js';

/**
 * Предел ожидания приёма. Без него молчащая — не отказавшая — служба держит отправку до
 * умолчания среды, а это минуты: человек, позвавший команду, видит не отказ, а зависший запуск.
 */
export const SHIP_TIMEOUT_MS: number = 15_000;

/** Что уезжает одним запросом: род груза словом, операция приёма и тело. */
export interface IShipment {
    /** Род груза словами — его называет отказ: дерево шлёт три рода и должно знать, какой отбит. */
    readonly kind: string;
    /** Последнее звено адреса операции: `summary`, `proposals`, `postmortems`. */
    readonly operation: string;
    readonly body: unknown;
}

/** Чем кончился один запрос. Отказ — такой же ответ, как принятое: его печатает вызывающий. */
export interface IShipped {
    readonly ok: boolean;
    /** Код ответа. Ноль — приём не ответил вовсе: не дозвонились, оборвалось, вышло время. */
    readonly status: number;
    /** Что сказал приём. У неотвеченного запроса — причина, по которой он не состоялся. */
    readonly said: string;
    /** Дерево и месяц записи. Пусто у отказа: приём их называет только у принятого груза. */
    readonly accepted: IIntakeAccepted | null;
}

/** Чем груз уезжает. Двойник в спеке — того же вида. */
export type TShip = (intake: string, token: string, shipment: IShipment) => Promise<IShipped>;

/** Адрес без косых черт в конце: их считает сам вызывающий, а не движок разбора образцов. */
function withoutTrailingSlash(address: string): string {
    let end: number = address.length;

    while (end > 0 && address[end - 1] === '/') {
        end -= 1;
    }

    return address.slice(0, end);
}

/** Адрес операции приёма. Косая черта в конце адреса приёма второй не становится. */
export function intakeUrl(intake: string, operation: string): string {
    return `${withoutTrailingSlash(intake)}/api/intake/${operation}`;
}

/**
 * Токен дерева из файла, названного настройкой.
 *
 * Путь читается и от корня дерева, и от домашнего каталога: токен обязан лежать вне дерева —
 * конфиг коммитится, а токен переживать историю не должен. Файла нет — пустая строка, и отказ
 * об этом скажет словами.
 */
function tokenFile(root: string, spoken: string): string {
    if (spoken.startsWith('~/')) {
        return join(homedir(), spoken.slice(2));
    }

    return isAbsolute(spoken) ? spoken : join(root, spoken);
}

export function readToken(root: string, spoken: string): string {
    if (!spoken) {
        return '';
    }

    // Абсолютный путь берётся как есть: склеенный с корнем, он ищет токен внутри дерева, где
    // его нет, и отправка отказывает с текстом о ненайденном файле.
    const path: string = tokenFile(root, spoken);

    return existsSync(path) ? readFileSync(path, 'utf8').trim() : '';
}

/** Число из ответа приёма. Не число — пусто: поля есть только у предложений и не у всякого приёма. */
function countOf(said: Record<string, unknown>, field: string): number | undefined {
    return typeof said[field] === 'number' ? said[field] : undefined;
}

/** Дерево и месяц из ответа приёма. Ответ не тем — пусто: своё устройство приём не пересказывает. */
function acceptedOf(text: string): IIntakeAccepted | null {
    try {
        const said: Record<string, unknown> = JSON.parse(text) as Record<string, unknown>;

        return typeof said['tree'] === 'string' && typeof said['month'] === 'string'
            ? {
                  tree: said['tree'],
                  month: said['month'],
                  created: said['created'] === true,
                  added: countOf(said, 'added'),
                  known: countOf(said, 'known'),
              }
            : null;
    } catch {
        return null;
    }
}

/** Что сказал приём: его собственное сообщение, а если тело не разбирается — тело как приехало. */
function saidOf(text: string): string {
    try {
        const said: Record<string, unknown> = JSON.parse(text) as Record<string, unknown>;

        return typeof said['message'] === 'string' ? said['message'] : text.trim();
    } catch {
        return text.trim();
    }
}

/** Запрос приёма. Токен уезжает заголовком и в теле не появляется ни разу. */
export const httpShip: TShip = async (intake: string, token: string, shipment: IShipment): Promise<IShipped> => {
    let answer: Response;

    try {
        answer = await fetch(intakeUrl(intake, shipment.operation), {
            method: 'POST',
            headers: { 'content-type': 'application/json', [TREE_TOKEN_HEADER]: token },
            body: JSON.stringify(shipment.body),
            signal: AbortSignal.timeout(SHIP_TIMEOUT_MS),
        });
    } catch (error: unknown) {
        return { ok: false, status: 0, said: (error as Error).message, accepted: null };
    }

    const text: string = await answer.text();

    return { ok: answer.ok, status: answer.status, said: saidOf(text), accepted: answer.ok ? acceptedOf(text) : null };
};

/** Два числа и отбитые строки из ответа приёма. Ответ не тем — пусто. */

/** Запрос правки состояния. Токен уезжает заголовком и в теле не появляется ни разу. */
