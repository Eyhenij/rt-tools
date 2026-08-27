#!/usr/bin/env node
/**
 * Отбор записей груза, чья правка уже стоит в дереве.
 *
 * Живёт в дереве, а не в пакете: у дерева, которое пакет только потребляет, источников ресурсов
 * нет вовсе — искать статью там негде.
 *
 * Предложение везёт цитату предлагаемой статьи, а у статьи есть заголовок. Заголовок либо стоит
 * в источниках пакета, либо нет: первое означает, что правка приехала редакцией и запись давно
 * готова, второе — что запись ждёт своей задачи. Иначе такая запись висит в «новом» и
 * разбирается заново каждым заходом: предложение читается, ресурс открывается, статья находится
 * стоящей.
 *
 * Судится один заголовок и ничего сверх него. Запись, чьё предложение легло в дерево другими
 * словами, командой не находится и остаётся новой — это её граница, и она названа в выводе.
 *
 * Наружу команда не пишет ничего: она читает груз и печатает вызов отметки. Ставит отметку
 * `cargo:mark`, и ставит её человек, прочитавший перечень.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { accountOf, login, read, withTexts } from './cargo-pull.mjs';

const REFUSED = 1;
const PAGE_SIZE = 100;
const PAGES_MAX = 20;

const ROOT = resolve(process.cwd());
const CONFIG = join(ROOT, '.claude/rt-kit.json');
const SOURCES = join(ROOT, 'projects/agent-kit/assets');
const SHIPMENT = join(ROOT, 'dist/agent-kit/lib/shipment.js');

/**
 * Признак дерева: тот же, которым груз отправляли, и берётся он у пакета, а не считается здесь.
 * Своя копия счёта уже расходилась с пакетной молча — дерево слало груз под одним признаком, а
 * отмечало под другим, и ни одна запись не отметилась ни разу.
 */
async function treeSlug() {
    try {
        const { treeSlugOf } = await import(SHIPMENT);
        const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: ROOT, encoding: 'utf8' }).trim();

        return treeSlugOf(remote, '');
    } catch {
        return '';
    }
}

/** Заголовок статьи из цитаты предложения: первое жирное внутри цитируемого блока. */
export function titleOf(text) {
    const quote = String(text ?? '')
        .split('\n')
        .filter((line) => line.startsWith('>'))
        .map((line) => line.replace(/^>\s?/, ''))
        .join('\n');
    const bold = /\*\*(.+?)\*\*/s.exec(quote);

    return bold ? bold[1].replace(/\s+/g, ' ').trim() : '';
}

/** Все тексты источников пакета одной строкой: искать заголовок по ним дешевле, чем звать grep. */
function sourcesText(dir) {
    if (!existsSync(dir)) {
        return '';
    }

    let all = '';

    for (const name of readdirSync(dir)) {
        const path = join(dir, name);

        all += statSync(path).isDirectory() ? sourcesText(path) : `\n${readFileSync(path, 'utf8')}`;
    }

    return all;
}

/** Заголовок стоит в источниках: сравнение идёт по одной строке — переносы в цитате свои. */
export function standsIn(title, text) {
    return Boolean(title) && text.replace(/\s+/g, ' ').includes(title);
}

/** Разбор одной страницы записей: что нашлось, что нет и у чего цитаты не было вовсе. */
export function sift(rows, text) {
    const found = [];
    const waiting = [];
    const mute = [];

    for (const row of rows) {
        const title = titleOf(row.text);

        if (!title) {
            mute.push({ row, title });
        } else if (standsIn(title, text)) {
            found.push({ row, title });
        } else {
            waiting.push({ row, title });
        }
    }

    return { found, waiting, mute };
}

/** Все свои новые предложения: страницы дочитываются до конца, а не до первой. */
async function everything(intake, cookie, tree, fetchOne, fetchTexts) {
    const all = [];

    for (let page = 1; page <= PAGES_MAX; page += 1) {
        const got = await fetchOne(
            intake,
            cookie,
            `proposals?page=${page}&size=${PAGE_SIZE}&sort=arrivedAt&dir=asc&state=new&tree=${encodeURIComponent(tree)}`
        );

        if (!got.ok || !got.body) {
            return { ok: false, said: got.said, status: got.status, rows: all };
        }

        const rows = Array.isArray(got.body.rows) ? got.body.rows : [];

        all.push(...(await fetchTexts(intake, cookie, 'proposal', rows)));

        if (all.length >= Number(got.body.total ?? all.length) || !rows.length) {
            break;
        }
    }

    return { ok: true, said: '', status: 200, rows: all };
}

/**
 * Ключ отметки предложения — признак его текста, тот же, что считает приём, когда запись кладёт.
 * Опознаватель записи сюда не годится: отметка его не принимает и отвечает «такой записи нет».
 */
const keyOf = (row) => (typeof row.text === 'string' ? createHash('sha256').update(row.text, 'utf8').digest('hex') : '');

/** Ключи отобранных записей доводами команды отметки: она принимает их сколько угодно за вызов. */
const keys = (rows) => rows.map((one) => `--proposal ${keyOf(one.row)}`).join(' ');

/** Забрать свои новые записи и разобрать их на готовые и ждущие. */
export async function fixed(options) {
    if (!options.intake || !options.tree) {
        return { code: REFUSED, lines: ['адреса приёма или признака дерева нет: отбирать нечего'] };
    }

    const entered = await options.enter(options.intake, options.account);

    if (!entered.ok || !entered.cookie) {
        return { code: REFUSED, lines: [`${options.intake} вход не принял: ${entered.status || 'молчание'} — ${entered.said}`] };
    }

    const got = await everything(options.intake, entered.cookie, options.tree, options.fetchOne, options.fetchTexts);

    if (!got.ok) {
        return { code: REFUSED, lines: [`${options.intake} ответил ${got.status || 'молчанием'} — ${got.said}`] };
    }

    const { found, waiting, mute } = options.sift(got.rows, options.sources);

    return {
        code: 0,
        lines: [
            `ОТБОР — ${options.intake}, дерево ${options.tree}, состояние «new»`,
            `  своих записей ${got.rows.length}: статья уже стоит у ${found.length}, ждут задачи ${waiting.length}, без цитаты ${mute.length}`,
            '',
            ...found.flatMap(({ row, title }) => [`  ${keyOf(row)}`, `    ${row.resource ?? '?'} · ${title}`]),
            '',
            ...(found.length
                ? [
                      // Порядок состояний перескочить нельзя: из «нового» прямо в «готово» приём
                      // отбивает каждую строку словами «переход не разрешён порядком». Поэтому
                      // вызова два, и печатаются они оба — иначе первый же отбивается целиком.
                      `отметить их, вызова два подряд:`,
                      `  node tools/cargo-mark.mjs --state in_work ${keys(found)}`,
                      `  node tools/cargo-mark.mjs --state fixed --fix '<чем починено>' ${keys(found)}`,
                  ]
                : ['отмечать нечего: у своих новых записей ни одна предложенная статья в источниках не стоит']),
            'судится один заголовок статьи: запись, чьё предложение легло другими словами, здесь не находится',
        ],
    };
}

async function main() {
    const config = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, 'utf8')) : {};
    const named = accountOf(config.account ?? '');
    const outcome = await fixed({
        intake: process.env.RT_INTAKE || (config.intake ?? ''),
        tree: process.env.RT_TREE_SLUG || (await treeSlug()),
        account: {
            name: process.env.RT_ACCOUNT_NAME || named.name,
            password: process.env.RT_ACCOUNT_PASSWORD || named.password,
        },
        sources: sourcesText(SOURCES),
        enter: login,
        fetchOne: read,
        fetchTexts: withTexts,
        sift,
    });

    outcome.lines.forEach((line) => console.log(line));

    return outcome.code;
}

if (process.argv[1] && process.argv[1].endsWith('cargo-fixed.mjs')) {
    main().then((code) => process.exit(code));
}
