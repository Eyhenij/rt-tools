#!/usr/bin/env node
// rt-kit v0.16.1 · checks/check-descriptions.mjs · 540ba0bbcad1 · правится надстройкой, не здесь
/**
 * Сверка длины описаний правил и паттернов.
 *
 * Описание едет в системный промпт каждого захода — все, сколько их есть в дереве, — и
 * платит их заход, чем бы ни занимался. Тем оно и отличается от тела правила: тело
 * исполнитель читает сам и платит за это ходом, описание приходит даром. Даром — пока
 * оно короткое.
 *
 * Растёт оно само: описание пишут вслед за правилом и пересказывают в нём содержимое.
 * Ни одна проверка длины не считала, и на дереве, где эта сверка заводилась, сорок
 * описаний из семидесяти четырёх переросли предел.
 *
 * Отвечает описание на один вопрос — брать это правило или нет. Всё, что отвечает на
 * вопрос «а что там внутри», приходит вторым разом вместе с самим правилом.
 *
 * FAIL-OPEN: каталога скилов в дереве нет — сверять нечего, нулевой код.
 *
 * Описание длиннее предела, оставленное намеренно, называется в перечне принятого долга
 * рядом — по имени скила, с причиной. Молчаливое превышение и осознанное выглядят
 * одинаково, поэтому второе называется списком.
 *
 * Ненулевой код возврата и перечень превысивших с числами.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SKILLS = join(ROOT, '.claude/skills');
const DEBT = join(ROOT, '.claude/rt-kit/description-debt.json');

/**
 * Предел длины описания в знаках.
 *
 * Считаются знаки, а не байты: байт о цене окна не говорит, а кириллица делает его в
 * полтора раза больше знака. Триста — число владельца, назначенное от первого замера.
 */
const LIMIT = 300;

/** Описание из шапки: строка `description:` до конца строки. */
function descriptionOf(text) {
    const match = /^description:\s*(.+)$/m.exec(text);

    return match === null ? null : match[1].trim();
}

/** Перечень принятого долга: имя скила → причина. Нет файла — долга нет. */
function debt() {
    if (!existsSync(DEBT)) {
        return {};
    }

    try {
        return JSON.parse(readFileSync(DEBT, 'utf8'));
    } catch {
        return {};
    }
}

function main() {
    if (!existsSync(SKILLS)) {
        console.log('check-descriptions: каталога скилов нет — сверять нечего');

        return 0;
    }

    const accepted = debt();
    const over = [];
    const owed = [];
    let counted = 0;

    for (const name of readdirSync(SKILLS)) {
        const file = join(SKILLS, name, 'SKILL.md');

        if (!existsSync(file)) {
            continue;
        }

        const description = descriptionOf(readFileSync(file, 'utf8'));

        if (description === null) {
            continue;
        }

        counted += 1;

        if (description.length <= LIMIT) {
            continue;
        }

        if (Object.hasOwn(accepted, name)) {
            owed.push(`${name}: ${description.length} знаков — ${accepted[name]}`);
            continue;
        }

        over.push({ name, length: description.length });
    }

    for (const line of owed) {
        console.log(`  долг ${line}`);
    }

    if (over.length > 0) {
        over.sort((first, second) => second.length - first.length);
        console.log(`check-descriptions: длиннее предела ${over.length} из ${counted}, предел ${LIMIT} знаков\n`);

        for (const item of over) {
            console.log(`  ${item.name}: ${item.length} знаков, лишних ${item.length - LIMIT}`);
        }

        console.log('\nОписание отвечает на один вопрос — брать это правило или нет. Перечисление разделов');
        console.log('и пересказ статей приходят вторым разом вместе с самим правилом.');
        console.log('Оставленное намеренно называется в .claude/rt-kit/description-debt.json с причиной.');

        return 1;
    }

    console.log(`check-descriptions: описаний ${counted}, все в пределе ${LIMIT} знаков` + (owed.length > 0 ? `, принятого долга ${owed.length}` : ''));

    return 0;
}

process.exit(main());
