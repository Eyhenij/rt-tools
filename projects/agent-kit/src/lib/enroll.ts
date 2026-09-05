/**
 * Заведение дерева: токен ложится на диск правами «читает и пишет только владелец файла».
 *
 * Путей два, и человек выбирает доводом.
 *
 * Обмен по коду — дерево просит токен у приёма, неся одноразовый код. Это вторая и последняя
 * команда пакета, которая ходит в сеть, и единственная, которая ходит туда без токена: токена у
 * дерева ещё нет, за ним и обращаются.
 *
 * Выданный токен — тот, что человек получил прямо в админке приёма. Обменивать не на что, и в
 * сеть команда не идёт вовсе: она кладёт полученное на диск теми же правами. Отсюда и разный
 * набор проверок — адрес приёма и запрет открытого пути этому пути не нужны.
 *
 * Ходит она только по слову человека. Гарды в сеть не ходят вовсе, и заведение — не исключение:
 * дерево заводят один раз, руками.
 *
 * Сеть здесь отделена от решения так же, как у отправки груза: чем сходить, приходит доводом, и
 * спека подставляет двойник, никуда не стучась.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join } from 'node:path';

import { IEnrollGranted } from './cargo.js';
import { intakeUrl, SHIP_TIMEOUT_MS } from './ship.js';

/** Права файла с токеном: читает и пишет только владелец файла. */
const TOKEN_MODE: number = 0o600;

/** Тело обращения: признак дерева и код приглашения. Имени в нём нет — его знает приглашение. */
export interface IEnrollBody {
    readonly schema: string;
    readonly tree: string;
    readonly code: string;
}

/** Чем кончилось обращение. Отказ — такой же ответ, как выданный токен: его печатает вызывающий. */
export interface IEnrollAnswer {
    readonly ok: boolean;
    /** Код ответа. Ноль — приём не ответил вовсе: не дозвонились, оборвалось, вышло время. */
    readonly status: number;
    readonly said: string;
    /** Токен и имя дерева. Пусто у отказа: приём называет их только у годного обращения. */
    readonly granted: IEnrollGranted | null;
}

/** Чем обращение уходит в приём. Двойник в спеке — того же вида. */
export type TEnrollCall = (intake: string, body: IEnrollBody) => Promise<IEnrollAnswer>;

/** Что нужно заведению: где дерево, куда идти, чем платить и куда класть токен. */
export interface IEnrollOptions {
    readonly root: string;
    readonly intake: string;
    readonly code: string;
    /**
     * Токен, выданный человеку прямо в админке приёма.
     *
     * Второй путь завести дерево, и сети он не требует вовсе: токен уже на руках, обменивать не
     * на что. С кодом приглашения не сочетается — это два пути к одному и тому же.
     */
    readonly issued: string;
    /** Признак дерева, посчитанный от адреса репозитория. */
    readonly tree: string;
    /** Файл токена — путь от корня дерева или от домашнего каталога. */
    readonly token: string;
    /** Перезаписать лежащий токен намеренно. Без него дерево с токеном обращения не шлёт. */
    readonly force: boolean;
    readonly call: TEnrollCall;
}

/** Что команда напечатала и чем кончилась. Строки печатает вызывающий. */
export interface IEnrollOutcome {
    readonly code: number;
    readonly lines: readonly string[];
}

/** Отказ команды: причина строками и ненулевой код выхода. */
function refusal(...lines: readonly string[]): IEnrollOutcome {
    return { code: 1, lines };
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

/** Токен и имя из ответа приёма. Ответ не тем — пусто: своё устройство приём не пересказывает. */
function grantedOf(text: string): IEnrollGranted | null {
    try {
        const said: Record<string, unknown> = JSON.parse(text) as Record<string, unknown>;

        return typeof said['token'] === 'string' && typeof said['tree'] === 'string' && typeof said['name'] === 'string'
            ? { tree: said['tree'], name: said['name'], token: said['token'] }
            : null;
    } catch {
        return null;
    }
}

/**
 * Годен ли адрес приёма для обращения без TLS.
 *
 * Токен уходит единственным ответом на это обращение, и по открытому пути его читает всякий, кто
 * стоит между сторонами. Исключение одно — локальная машина: там приём поднимают для проверки, и
 * сети между сторонами нет вовсе.
 */
export function intakeAllowed(intake: string): boolean {
    const address: string = intake.trim().toLowerCase();

    if (address.startsWith('https://')) {
        return true;
    }

    return /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])([:/]|$)/.test(address);
}

/**
 * Куда ложится токен: путь от домашнего каталога, от корня дерева либо названный целиком.
 *
 * Абсолютный берётся как есть: склеенный с корнем, он кладёт секрет внутрь репозитория —
 * `/Users/…/rt-kit/tree.token` становился `<дерево>/Users/…/rt-kit/tree.token`, и владелец
 * получал токен там, откуда он уезжает в историю первой же командой добавления.
 */
export function tokenPath(root: string, spoken: string): string {
    if (spoken.startsWith('~/')) {
        return join(homedir(), spoken.slice(2));
    }

    return isAbsolute(spoken) ? spoken : join(root, spoken);
}

/** Запись токена на диск: у обоих путей она одна, и права файла у неё одни. */
function lay(path: string, token: string): void {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${token}\n`, { encoding: 'utf8', mode: TOKEN_MODE });
}

/** Токен с рук: приём о нём не спрашивается — он же его и выдал, и обменивать не на что. */
function accept(options: IEnrollOptions, path: string): IEnrollOutcome {
    lay(path, options.issued);

    return {
        code: 0,
        lines: [
            'дерево заведено токеном, выданным в админке приёма',
            `токен лежит в ${path}, читать и писать его может только владелец файла`,
            'проверить связь с приёмом: `agent-kit propose --dry-run`',
        ],
    };
}

/** Обращение и запись токена: сюда доходит только то, что прошло проверки у себя. */
async function grant(options: IEnrollOptions, path: string): Promise<IEnrollOutcome> {
    const answer: IEnrollAnswer = await options.call(options.intake, { schema: '1', tree: options.tree, code: options.code });

    if (!answer.ok || !answer.granted) {
        return refusal(answer.status === 0 ? `приём не ответил: ${answer.said}` : `приём отказал (${answer.status}): ${answer.said}`);
    }

    lay(path, answer.granted.token);

    return {
        code: 0,
        lines: [
            `дерево заведено: «${answer.granted.name}» (${answer.granted.tree})`,
            `токен лежит в ${path}, читать и писать его может только владелец файла`,
            'приглашение погашено: второй раз им не воспользоваться',
        ],
    };
}

/**
 * Выбран ли путь: отказ, когда доводов два или ни одного, и пусто, когда выбран ровно один.
 *
 * Стоит отдельно от самого заведения: разбор довода и порядок проверок — два разных решения, и
 * вместе они не читаются.
 */
function pathChosen(options: IEnrollOptions): IEnrollOutcome | null {
    if (options.code && options.issued) {
        return refusal(
            'код приглашения и выданный токен — два разных пути завести дерево, и вместе они не идут',
            'оставьте один довод: --code <код> либо --token <токен>'
        );
    }

    if (!options.code && !options.issued) {
        return refusal(
            'заведение ждёт одно из двух:',
            '  --code <код>     код приглашения, выданный владельцем приёма',
            '  --token <токен>  токен, выданный человеку прямо в админке приёма'
        );
    }

    return null;
}

/** Годен ли приём для обмена по коду. Пути с рук эти проверки не касаются: он в сеть не идёт. */
function intakeReady(options: IEnrollOptions): IEnrollOutcome | null {
    if (!options.intake) {
        return refusal(
            'в настройке дерева не назван адрес приёма: заполните ключ `intake`',
            'адрес берётся у того же человека, который выдал код приглашения: код и адрес идут парой'
        );
    }

    if (!intakeAllowed(options.intake)) {
        return refusal(
            `адрес приёма ${options.intake} без TLS: токен уходит единственным ответом, и по открытому пути его прочитает всякий`,
            'поправьте ключ `intake` на https://… — исключение сделано только для локальной машины'
        );
    }

    return null;
}

/**
 * Заведение дерева.
 *
 * Порядок проверок такой, что до сети доходит только то, что имеет шанс: незаполненная настройка,
 * открытый адрес и уже лежащий токен отбиваются здесь, у себя. Общие обоим путям проверки стоят
 * до развилки: поставленные после, они защищали бы только один из них.
 */
export async function enroll(options: IEnrollOptions): Promise<IEnrollOutcome> {
    const chosen: IEnrollOutcome | null = pathChosen(options);

    if (chosen) {
        return chosen;
    }

    if (!options.token) {
        return refusal('в настройке дерева не назван файл токена: заполните ключ `token`');
    }

    const laid: string = tokenPath(options.root, options.token);

    if (existsSync(laid) && !options.force) {
        return refusal(
            `токен уже лежит в ${laid}: заведённое дерево потеряло бы связь со своим прежним грузом`,
            'если это намеренно — позовите ту же команду с доводом --force'
        );
    }

    if (options.issued) {
        return accept(options, laid);
    }

    const reachable: IEnrollOutcome | null = intakeReady(options);

    return reachable ?? grant(options, laid);
}

/** Обращение в приём по-настоящему. Код уезжает телом и в заголовки не попадает. */
export const httpEnroll: TEnrollCall = async (intake: string, body: IEnrollBody): Promise<IEnrollAnswer> => {
    let answer: Response;

    try {
        answer = await fetch(intakeUrl(intake, 'enroll'), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(SHIP_TIMEOUT_MS),
        });
    } catch (error: unknown) {
        return { ok: false, status: 0, said: (error as Error).message, granted: null };
    }

    const text: string = await answer.text();

    return { ok: answer.ok, status: answer.status, said: saidOf(text), granted: answer.ok ? grantedOf(text) : null };
};
