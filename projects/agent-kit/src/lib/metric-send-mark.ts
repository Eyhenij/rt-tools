/**
 * Метка отправки: что отправка помнит о себе и как её сбой называется человеку.
 *
 * Отдельным файлом, потому что её читают `doctor` и раскладка, а сама отправка считает числа отчётом,
 * и отчёт стоит на тех же командах.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { IConfig, readConfig } from './config.js';
import { OBSERVATIONS_DIR } from './observations.js';
import { readToken } from './ship.js';

/** Числа дерева на момент отправки: они про дерево, а не про день, и едут только сегодняшней строкой. */
export interface ITreeFacts {
    readonly rulesLaidOut: number;
    readonly rulesDead: number | null;
    readonly sectionsTotal: number;
    readonly sectionsOverridden: number;
    readonly entryChars: number | null;
    readonly outcomesBroken: number;
    /** Итоги спросить некого: дерево без функции не то же самое, что дерево без итогов. */
    readonly outcomesUnread: number;
    readonly sendFault: number;
}

/** Причина сбоя числом: в строке дня текста быть не может. */
export enum ESendFault {
    None = 0,
    Network = 1,
    TokenRefused = 2,
    LineRefused = 3,
    Intake = 4,
    Leak = 5,
}

/** Что отправка помнит о себе. Лежит в копии: у каждой свой отрезок и свой сбой. */
export interface ISendMark {
    readonly tried: number;
    readonly succeeded: number;
    /** День последней удачной отправки: окно идёт от него. */
    readonly day: string;
    readonly failure: ESendFault;
    readonly reason: string;
    /** Сумма токена, который приём отказал: новый файл снимает остановку. */
    readonly refusedToken: string;
    /** С какой минуты отправка не удаётся: начало сессии называет сбой старше суток, а не попытку. */
    readonly failureSince: number;
    /**
     * Числа дерева по дням окна. Приём замещает день целиком, а считаются они только на сегодня, поэтому
     * повтор дня без них стёр бы лежащие на приёме.
     */
    readonly factsByDay: Readonly<Record<string, ITreeFacts>>;
}

const EMPTY_MARK: ISendMark = {
    tried: 0,
    succeeded: 0,
    day: '',
    failure: ESendFault.None,
    reason: '',
    refusedToken: '',
    failureSince: 0,
    factsByDay: {},
};

export function marksDir(root: string): string {
    return join(root, OBSERVATIONS_DIR, '.marks');
}

export function markPath(root: string): string {
    return join(marksDir(root), 'send.json');
}

/** Поля метки до переименования: метка, записанная прежней версией, читается по ним. */
interface ISendMarkBefore {
    readonly fault?: ESendFault;
    readonly faultSince?: number;
}

/**
 * Метка копии. Битая читается как пустая: отправка не должна остановиться из-за своей записи. Метка
 * прежней версии читается по старым именам полей, следующая запись кладёт новые.
 */
export function readSendMark(root: string): ISendMark {
    try {
        const raw: Partial<ISendMark> & ISendMarkBefore = JSON.parse(readFileSync(markPath(root), 'utf8')) as Partial<ISendMark> &
            ISendMarkBefore;
        const { fault: before, faultSince: beforeSince, ...rest }: Partial<ISendMark> & ISendMarkBefore = raw;

        return {
            ...EMPTY_MARK,
            ...rest,
            failure: rest.failure ?? before ?? ESendFault.None,
            failureSince: rest.failureSince ?? beforeSince ?? 0,
        };
    } catch {
        return EMPTY_MARK;
    }
}

/**
 * Что сказать при раскладке, если она включила отправку. Дерево с адресом начинает слать числа без
 * новых шагов, и узнать об этом из молчания нельзя.
 */
export function sendEnrolledLines(config: IConfig, written: readonly string[]): readonly string[] {
    if (!config.intake || !config.send || !written.some((path: string): boolean => path.endsWith('metric-send-start.sh'))) {
        return [];
    }

    return ['отправка чисел включена: дерево с адресом приёма шлёт строки дня само, выключает ключ `send: false`'];
}

/** Сбой отправки словами: его называют `doctor` и начало сессии. Пусто: сбоя нет. */
export function sendFaultLines(root: string): readonly string[] {
    const mark: ISendMark = readSendMark(root);
    const config: IConfig | null = readConfig(root);
    const noToken: boolean = Boolean(config?.intake) && config?.send !== false && !readToken(root, config?.token ?? '');

    return [
        // Токен лежит вне дерева, а настройка в истории: вторая машина того же дерева молчит именно так.
        ...(noToken ? ['числа дерева не уходят: адрес приёма есть, файла токена на этой машине нет'] : []),
        ...(mark.failure === ESendFault.None ? [] : [`последняя отправка чисел не удалась: ${mark.reason}`]),
        ...(mark.refusedToken ? ['попытки остановлены, пока файл токена не сменится'] : []),
    ];
}
