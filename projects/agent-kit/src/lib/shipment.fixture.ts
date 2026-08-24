/**
 * Одноразовое дерево для спек отправки: настройка, двойники приёма и блоки предложений.
 *
 * Живёт отдельным модулем потому, что спек об отправке две — про сам груз и про отбой блоков, —
 * и обвязка у них одна. Скопированная во второй файл, она разошлась бы с первым молча: двойник
 * приёма отвечает полем, которое читают обе.
 *
 * Хуки жизни дерева модуль не ставит: он не набор спек, и глобальных хуков среды прогона у него
 * нет. Заводит и сносит дерево вызывающий — двумя строками в своих хуках.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { IEnvironment, init, IOutcomeOfCommand } from './commands.js';
import { CONFIG_PATH } from './config.js';
import { PROPOSALS_DIR } from './proposals.js';
import { IShipment, IShipped, TShip } from './ship.js';
import { propose } from './shipment.js';

export const VERSION: string = '0.1.0';
export const TODAY: string = '2026-08-14';
/** Ресурсы берутся из дерева пакета: снимок надстроек снимается с настоящего текста. */
export const ASSETS: string = join(__dirname, '..', '..', 'assets');
export const INTAKE: string = 'https://intake.test';
export const REMOTE: string = 'git@github.test:owner/tree.git';
export const TOKEN_FILE: string = '.secret-token';
export const TOKEN: string = 'токен-этого-дерева';
/** Ответ приёма о непринятом токене: им отвечает отозванный. */
export const TOKEN_REFUSED: number = 401;
/** Файл предложений одноразового дерева: имя одно на все спеки — по нему же читают отметки. */
export const PROPOSALS_FILE: string = `${PROPOSALS_DIR}/2026-08-12-probe.md`;

/** Что уехало двойником — по запросу на строку, в том порядке, в каком уезжало. */
export let sent: IShipment[] = [];

let root: string = '';
let env: IEnvironment = { root: '', version: VERSION, assetsDir: ASSETS };

/** Корень одноразового дерева: он меняется каждой спекой, поэтому спрашивается, а не хранится. */
export function treeRoot(): string {
    return root;
}

export function put(path: string, text: string): void {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text, 'utf8');
}

export function get(path: string): string {
    return readFileSync(join(root, path), 'utf8');
}

export function said(outcome: IOutcomeOfCommand): string {
    return outcome.lines.join('\n');
}

/** Двойник приёма: отвечает принятым и называет месяц, как настоящий. */
export function accepting(created: boolean = true): TShip {
    return async (intake: string, token: string, shipment: IShipment): Promise<IShipped> => {
        sent.push(shipment);

        return {
            ok: Boolean(intake && token),
            status: created ? 201 : 200,
            said: '',
            accepted: { tree: 'дерево', month: '2026-08', created },
        };
    };
}

/** Двойник приёма, который груз не принял: отозванный токен отвечает именно так. */
export function refusing(status: number, message: string): TShip {
    return async (_intake: string, _token: string, shipment: IShipment): Promise<IShipped> => {
        sent.push(shipment);

        return { status, ok: false, said: message, accepted: null };
    };
}

/** Настройка дерева: конфиг заводится командой, а ключи отправки дописываются поверх. */
export function start(patch: Record<string, unknown> = {}): void {
    init(root, [], { host: 'github' });
    const config: Record<string, unknown> = JSON.parse(get(CONFIG_PATH)) as Record<string, unknown>;
    writeFileSync(join(root, CONFIG_PATH), JSON.stringify({ ...config, intake: INTAKE, token: TOKEN_FILE, ...patch }, null, 4), 'utf8');
    put(TOKEN_FILE, `${TOKEN}\n`);
}

export function shipping(ship: TShip = accepting(), dryRun: boolean = false): Promise<IOutcomeOfCommand> {
    return propose(env, { dryRun, ship, remote: REMOTE, today: TODAY, days: 3 });
}

/** Блоки предложений ложатся одним файлом дня: их порядок и есть порядок в файле. */
export function proposals(blocks: readonly string[]): void {
    put(PROPOSALS_FILE, `# Предложения\n\n${blocks.join('\n\n')}\n`);
}

/** Забыть уехавшее: спеке о повторной отправке нужен чистый счёт со второго прогона. */
export function clearSent(): void {
    sent = [];
}

/** Что уехало операциями, по порядку: этим спеки и судят состав груза. */
export function operationsSent(): readonly string[] {
    return sent.map((shipment: IShipment): string => shipment.operation);
}

/** Завести одноразовое дерево: зовётся в `beforeEach` спеки. */
export function freshTree(): void {
    root = mkdtempSync(join(tmpdir(), 'agent-kit-ship-'));
    env = { root, version: VERSION, assetsDir: ASSETS };
    sent = [];
}

/** Снести его: зовётся в `afterEach` спеки. */
export function dropTree(): void {
    rmSync(root, { recursive: true, force: true });
}
