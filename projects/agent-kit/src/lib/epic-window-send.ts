/**
 * Отправка окон эпика: каждое окно уходит своей записью в `epic-windows` под признаком копии.
 *
 * Окна считает `checks/work-result.mjs` по наблюдениям всех копий машины: сессия на ветке эпика могла
 * идти в соседней копии. Окно шлёт копия, прочитавшая слияние, которое его открыло: слияние читается
 * одним разом на машину. Флаги «слит» и «выпущен» пересчитываются при каждой отправке, пока эпик не
 * выпущен: изменённое окно уходит заново с новым штампом, после «выпущен» — больше не уходит.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { CARGO_SCHEMA_VERSION, IEpicWindowCargo } from './cargo.js';
import { KEEP_DAYS, OBSERVATIONS_DIR } from './observations.js';
import { sharedMarksDir } from './outcomes.js';
import { IShipped, TShip } from './ship.js';

/** Метка отправленных окон в общем каталоге меток машины: её читает любая копия. */
export const EPIC_WINDOWS_MARK: string = 'epic-windows.json';

/** Ответ сценария больше любого дня записи. */
const MAX_BUFFER: number = 256 * 1024 * 1024;

/** Чтение слияний ходит к хостингу и реестру: дольше минуты оно не держит отправку. */
const MERGES_TIMEOUT_MS: number = 60_000;

/** Окно эпика, как его даёт подсчёт результата. */
export interface ISendingWindow {
    readonly from: string;
    readonly to: string | null;
    readonly calls: number;
    readonly refusals: number;
    readonly reasks: number;
    /** Слияние, открывшее окно, лежит в наблюдениях этой копии. */
    readonly own: boolean;
}

/** Статус эпика к концу последнего дня, как его пишет `checks/merge-read.mjs`. */
export enum EEpicStatus {
    Released = 'released',
    NotReleased = 'not-released',
    Merged = 'merged',
    Open = 'open',
}

/** Эпик периода со своими окнами. */
export interface ISendingEpic {
    readonly epic: string;
    readonly status: EEpicStatus;
    readonly mergedAt: string | null;
    readonly releasedAt: string | null;
    readonly minutes: number | null;
    readonly windows: readonly ISendingWindow[];
}

/** Что ушло по окну: отпечаток по ключу окна. */
export type TWindowMark = Readonly<Record<string, string>>;

/** Окно, готовое к отправке, и его отпечаток для метки. */
export interface IWindowToSend {
    readonly key: string;
    readonly print: string;
    readonly cargo: IEpicWindowCargo;
}

/** Общее у всех окон одной отправки. */
export interface IWindowHead {
    readonly tree: string;
    readonly origin: string;
    readonly stamp: number;
}

export interface IWindowSendWork {
    readonly root: string;
    readonly assetsDir: string;
    readonly intake: string;
    readonly token: string;
    readonly head: IWindowHead;
    readonly today: string;
    readonly ship: TShip;
}

/** Ключ окна в метке: эпик и момент открытия. */
function keyOf(epic: string, window: ISendingWindow): string {
    return `${epic}|${window.from}`;
}

/** Номер эпика из ключа задач: `RT-3227` → 3227. */
function epicNumber(epic: string): number {
    return Number(epic.replace(/\D/g, ''));
}

/** Отпечаток окна без штампа: окно уходит заново, только когда он изменился. */
function printOf(cargo: IEpicWindowCargo): string {
    return JSON.stringify({ ...cargo, stamp: 0 });
}

function cargoOf(epic: ISendingEpic, window: ISendingWindow, head: IWindowHead): IEpicWindowCargo {
    const released: boolean = epic.status === EEpicStatus.Released;

    return {
        schema: CARGO_SCHEMA_VERSION,
        tree: head.tree,
        origin: head.origin,
        epic: epicNumber(epic.epic),
        from: window.from,
        to: window.to,
        calls: window.calls,
        refusals: window.refusals,
        reasks: window.reasks,
        merged: epic.mergedAt ? 1 : 0,
        released: released ? 1 : 0,
        mergedAt: epic.mergedAt,
        releasedAt: released ? epic.releasedAt : null,
        minutes: epic.minutes,
        stamp: head.stamp,
    };
}

/** Окно ушло с «выпущен»: его эпик кончен, и оно больше не уходит. */
function finished(print: string | undefined): boolean {
    return print !== undefined && (JSON.parse(print) as IEpicWindowCargo).released === 1;
}

/** Окна к отправке: свои окна, чей отпечаток не совпадает с ушедшим. */
export function windowsToSend(epics: readonly ISendingEpic[], sent: TWindowMark, head: IWindowHead): readonly IWindowToSend[] {
    return epics.flatMap((epic: ISendingEpic): IWindowToSend[] =>
        epic.windows
            .filter((window: ISendingWindow): boolean => window.own)
            .map((window: ISendingWindow): IWindowToSend => {
                const cargo: IEpicWindowCargo = cargoOf(epic, window, head);

                return { key: keyOf(epic.epic, window), print: printOf(cargo), cargo };
            })
            .filter((one: IWindowToSend): boolean => !finished(sent[one.key]) && sent[one.key] !== one.print)
    );
}

/** Каталоги наблюдений всех копий машины: эта копия первой. */
export function copiesOf(root: string): readonly string[] {
    const own: string = join(root, OBSERVATIONS_DIR);

    try {
        // eslint-disable-next-line sonarjs/no-os-command-from-path -- путь к git у каждой машины свой, и пакет его не знает
        const listed: string = execFileSync('git', ['-C', root, 'worktree', 'list', '--porcelain'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        });
        const others: readonly string[] = listed
            .split('\n')
            .filter((line: string): boolean => line.startsWith('worktree '))
            .map((line: string): string => join(line.slice('worktree '.length), OBSERVATIONS_DIR))
            .filter((dir: string): boolean => dir !== own && existsSync(dir));

        return [own, ...others];
    } catch {
        return [own];
    }
}

/** Эпики срока хранения по наблюдениям всех копий. Сбой подсчёта: окон нет, строки дня это не трогает. */
export function sendingEpicsOf(root: string, assetsDir: string, today: string): readonly ISendingEpic[] {
    const [own, ...others]: readonly string[] = copiesOf(root);

    try {
        const out: string = execFileSync(
            process.execPath,
            [
                join(assetsDir, 'checks', 'work-result.mjs'),
                '--epics',
                '--own',
                own,
                ...others.flatMap((dir: string): string[] => ['--observations', dir]),
                '--until',
                today,
                '--days',
                String(KEEP_DAYS),
            ],
            { encoding: 'utf8', maxBuffer: MAX_BUFFER, stdio: ['ignore', 'pipe', 'pipe'] }
        );

        return (JSON.parse(out) as { readonly epics: readonly ISendingEpic[] }).epics;
    } catch {
        return [];
    }
}

function markFile(root: string): string {
    return join(sharedMarksDir(root), EPIC_WINDOWS_MARK);
}

/** Метка окон. Битая читается как пустая: окна уйдут заново, приём заменит их по ключу. */
export function readWindowMark(root: string): TWindowMark {
    try {
        return JSON.parse(readFileSync(markFile(root), 'utf8')) as TWindowMark;
    } catch {
        return {};
    }
}

/**
 * Слияния и редакции до подсчёта окон: окно открывает и закрывает слияние, а выпуск судится редакцией.
 * Чтение идёт хуком профиля дерева; нет хука или чтение оборвалось — окна считаются по прочитанному
 * раньше, а хук сам назвал сбой своим кодом выхода.
 */
export function readMerges(root: string): void {
    const hook: string = join(root, '.claude', 'hooks', 'pull-merges.sh');

    if (!existsSync(hook)) {
        return;
    }
    try {
        execFileSync(hook, [], { cwd: root, stdio: 'ignore', timeout: MERGES_TIMEOUT_MS });
    } catch {
        // Код 3 — спросить некого, код 4 — чтение оборвалось: окна идут по прочитанному раньше.
    }
}

/**
 * Окна по одной записи. Ушедшее окно попадает в метку сразу: сбой на следующем не шлёт его второй раз.
 * Старый штамп значит, что новое окно уже лежит: это не сбой. Возвращает ответ, на котором отправка
 * встала, или `null`.
 */
export async function shipWindows(work: IWindowSendWork): Promise<IShipped | null> {
    const sent: Record<string, string> = { ...readWindowMark(work.root) };

    for (const window of windowsToSend(sendingEpicsOf(work.root, work.assetsDir, work.today), sent, work.head)) {
        const shipped: IShipped = await work.ship(work.intake, work.token, {
            kind: 'окно эпика',
            operation: 'epic-windows',
            body: window.cargo,
        });

        if (!shipped.ok && shipped.status !== 409) {
            return shipped;
        }
        sent[window.key] = window.print;
        writeFileSync(markFile(work.root), JSON.stringify(sent));
    }

    return null;
}
