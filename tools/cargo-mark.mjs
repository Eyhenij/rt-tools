#!/usr/bin/env node
/**
 * Отметка состояния груза: команда, которой исполнитель двигает свои записи в приёме.
 *
 * Живёт в дереве, а не в пакете правил. Отмечает записи тот, кто груз разбирает, а разбирает
 * его дерево, где стоит приёмник; у дерева, которое пакет только ставит, ни приёма, ни его
 * админки нет — звать эту команду там некому. Признак и его два вопроса — правило `agent-kit`.
 *
 * Форма груза берётся у пакета: её объявляет отправляющая сторона, и обе стороны обязаны читать
 * одно объявление. Из двух копий компилируется только одна, а расходятся они молча.
 *
 * Разбор доводов и сборка тела отделены от самого запроса нарочно: всё, что можно отбить до
 * сети, отбивается до сети — незнакомое состояние, вызов без записей и отсутствующий токен.
 *
 * Ненулевой код возврата у всего, что не легло: отбитая строка кончает команду ненулевым кодом.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const REFUSED = 1;
const TIMEOUT_MS = 15_000;
const TREE_TOKEN_HEADER = 'x-tree-token';

const POSTMORTEM_FLAG = '--postmortem';
const PROPOSAL_FLAG = '--proposal';
const FIX_FLAG = '--fix';
const RELEASE_FLAG = '--release';
const DRY_RUN_FLAG = '--dry-run';
const STATE_FLAG = '--state';

const ROOT = resolve(process.cwd());
const CONFIG = join(ROOT, '.claude/rt-kit.json');

/** Причина отбоя словами человека: по каждой видно, что делать дальше. */
const DENIAL_WORDS = {
    missing: 'такой записи у дерева нет',
    forbidden: 'переход не разрешён порядком',
    'no-fix-note': 'переход в починку без довода `--fix`',
    'extra-fix-note': 'довод `--fix` приехал не с переходом в починку',
    'no-release-version': 'переход в выпуск без довода `--release`',
    'extra-release-version': 'довод `--release` приехал не с переходом в выпуск',
};

/** Форма груза у пакета: версия схемы и список состояний. Пакет не собран — команда об этом скажет. */
function shapeOfCargo() {
    const built = join(ROOT, 'dist/agent-kit/lib/cargo.js');

    if (!existsSync(built)) {
        return null;
    }

    return built;
}

/** Значение довода: то, что стоит сразу за ним и само доводом не является. */
function valueOf(argv, flag) {
    const at = argv.indexOf(flag);
    const next = at === -1 ? '' : (argv[at + 1] ?? '');

    return next.startsWith('--') ? '' : next;
}

/** Записи, названные доводами строки запуска: род у каждой свой, порядок — как их назвали. */
export function itemsOf(argv, state, attached = { fixNote: '', releaseVersion: '' }) {
    const items = [];

    for (let at = 0; at < argv.length; at += 1) {
        const kind = argv[at] === POSTMORTEM_FLAG ? 'postmortem' : argv[at] === PROPOSAL_FLAG ? 'proposal' : null;
        const key = argv[at + 1] ?? '';

        if (kind && key && !key.startsWith('--')) {
            // Приложенное значение едет полем строки, а не своим вызовом: отметка одна, и все её
            // записи чинились одним разбором либо уехали одним выпуском
            items.push({
                kind,
                key,
                state,
                ...(attached.fixNote ? { fixNote: attached.fixNote } : {}),
                ...(attached.releaseVersion ? { releaseVersion: attached.releaseVersion } : {}),
            });
        }
    }

    return items;
}

/**
 * Признак дерева: снимок его удалённой ссылки, а не название каталога на чьей-то машине.
 *
 * Считается тем же приёмом, что и на отправке, и приём этот берётся у пакета, а не пишется
 * здесь заново. Своя копия счёта уже разошлась с пакетной молча: она брала одно последнее слово
 * адреса, а пакет — адрес целиком и в нижнем регистре, — и дерево слало груз под одним
 * признаком, а отмечало его под другим. Приём отвечал на это «признак дерева в грузе
 * принадлежит другому дереву», и ни одна запись не отметилась ни разу.
 */
async function treeSlug(shape) {
    try {
        const { treeSlugOf } = await import(shape.replace(/cargo\.js$/, 'shipment.js'));
        const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: ROOT, encoding: 'utf8' }).trim();

        return treeSlugOf(remote, '');
    } catch {
        return '';
    }
}

/** Токен дерева из файла, названного настройкой: он лежит вне дерева и историю не переживает. */
function tokenOf(where) {
    if (!where) {
        return '';
    }

    const path = where.startsWith('~') ? join(homedir(), where.slice(1)) : resolve(ROOT, where);

    return existsSync(path) ? readFileSync(path, 'utf8').trim() : '';
}

/** Адрес операции приёма. */
function intakeUrl(intake, operation) {
    return `${intake.replace(/\/+$/, '')}/api/intake/${operation}`;
}

/** Что приём сказал словами: сообщение из ответа, а при неразборчивом — сам ответ. */
function saidOf(text) {
    try {
        const said = JSON.parse(text);

        return typeof said.message === 'string' ? said.message : text.trim();
    } catch {
        return text.trim();
    }
}

/** Запрос в приём. Отказ — такой же ответ, как принятое. */
async function callIntake(intake, token, body) {
    let answer;

    try {
        answer = await fetch(intakeUrl(intake, 'states'), {
            method: 'POST',
            headers: { 'content-type': 'application/json', [TREE_TOKEN_HEADER]: token },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch (error) {
        return { ok: false, status: 0, said: error.message, accepted: null };
    }

    const text = await answer.text();
    let accepted = null;

    if (answer.ok) {
        try {
            const parsed = JSON.parse(text);

            accepted = {
                changed: Number(parsed.changed ?? 0),
                same: Number(parsed.same ?? 0),
                denied: Array.isArray(parsed.denied) ? parsed.denied : [],
            };
        } catch {
            accepted = null;
        }
    }

    return { ok: answer.ok, status: answer.status, said: saidOf(text), accepted };
}

/** Пакет одной строкой: её читает человек перед тем, как отправить. */
function describe(items, state) {
    const postmortems = items.filter((one) => one.kind === 'postmortem').length;

    return `в «${state}»: разборов ${postmortems}, предложений ${items.length - postmortems}`;
}

/** Отбитая строка человеку: род, ключ и причина словами. */
function deniedLine(kind, key, denial) {
    return `  ${kind === 'postmortem' ? 'разбор' : 'предложение'} ${key} — ${DENIAL_WORDS[denial] ?? denial}`;
}

/** Отметить записи дерева названным состоянием. */
export async function mark(options) {
    if (!options.states.includes(options.state)) {
        return { code: REFUSED, lines: [`состояния «${options.state}» не бывает`, `бывают: ${options.states.join(', ')}`] };
    }

    if (options.items.length === 0) {
        return {
            code: REFUSED,
            lines: [
                'отмечать нечего: ни одной записи в доводах',
                `разбор называется \`${POSTMORTEM_FLAG} <имя файла>\`, предложение — \`${PROPOSAL_FLAG} <признак текста>\``,
            ],
        };
    }

    if (!options.token) {
        return {
            code: REFUSED,
            lines: [
                'токена дерева нет: отметка осталась неотправленной',
                'дерево заводится командой `enroll` пакета — по коду приглашения либо токеном из админки приёма',
            ],
        };
    }

    const body = { schema: options.schema, tree: options.tree, items: options.items };

    // Перечень печатается обоими прогонами, и разделены они не окончанием глагола, а первой
    // строкой: «уехало» и «уехало бы» отличаются двумя буквами в хвосте, а строки под ними
    // одинаковы до знака, и вывод сухого прогона читается сделанной работой.
    const listed = `  ${describe(options.items, options.state)}`;

    if (options.dryRun) {
        return {
            code: 0,
            lines: [
                'СУХОЙ ПРОГОН — наружу не ушло ничего, в приёме не переведено ни одной записи',
                `уехало бы в ${options.intake}, дерево ${options.tree}:`,
                listed,
                'отмечает это тот же вызов без `--dry-run`',
            ],
        };
    }

    const marked = await options.call(options.intake, options.token, body);

    if (!marked.ok || !marked.accepted) {
        return { code: REFUSED, lines: [`${options.intake} ответил ${marked.status || 'молчанием'} — ${marked.said}`] };
    }

    const { changed, same, denied } = marked.accepted;

    return {
        code: denied.length ? REFUSED : 0,
        lines: [
            `ОТМЕТКА — уходит в ${options.intake}, дерево ${options.tree}:`,
            listed,
            `отмечено: переведено ${changed}, уже стояло ${same}, отбито ${denied.length}`,
            ...denied.map((one) => deniedLine(one.kind, one.key, one.denial)),
        ],
    };
}

async function main() {
    const argv = process.argv.slice(2);
    const shape = shapeOfCargo();

    if (!shape) {
        console.log('пакет не собран: форма груза берётся у него — `pnpm exec nx build @rt-tools/agent-kit`');
        return REFUSED;
    }

    const { CARGO_SCHEMA_VERSION, CARGO_STATES } = await import(shape);
    const config = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, 'utf8')) : {};
    const state = valueOf(argv, STATE_FLAG);

    // Адрес приёма и токен берутся из окружения, когда оно их называет: так спека ставит рядом
    // свой приём и проверяет разбор ответа, не ходя в настоящий.
    const outcome = await mark({
        intake: process.env.RT_INTAKE || (config.intake ?? ''),
        tree: await treeSlug(shape),
        token: process.env.RT_TREE_TOKEN ?? tokenOf(config.token ?? ''),
        state,
        schema: CARGO_SCHEMA_VERSION,
        states: CARGO_STATES,
        items: itemsOf(argv, state, { fixNote: valueOf(argv, FIX_FLAG), releaseVersion: valueOf(argv, RELEASE_FLAG) }),
        dryRun: argv.includes(DRY_RUN_FLAG),
        call: callIntake,
    });

    outcome.lines.forEach((line) => console.log(line));

    return outcome.code;
}

if (process.argv[1] && process.argv[1].endsWith('cargo-mark.mjs')) {
    main().then((code) => process.exit(code));
}
