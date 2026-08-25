/**
 * Счёт цены контекста.
 *
 * Проверяется главным образом то, что число снимается не с файла: описание правила заход
 * получает полем, а словарь — выводом хука. Сверка «вес файла против веса того, что получено»
 * и есть весь смысл этой команды: считать файлы целиком проще, и разница между этими числами
 * больше самой экономии, которую по ним потом ищут.
 */
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { costLines, costOf, CostUnavailableError, entryTexts, ICost, IWeighed, weigh } from './cost.js';

/** Слово, которое печатает хук словаря: по нему видно, что вывод хука попал в счёт. */
const SPOKEN_BY_HOOK: string = 'словарное слово из вывода хука';

/** Тело правила, много длиннее своего описания: на нём видно, что считалось полем, а не файлом. */
const LONG_BODY: string = 'строка тела правила, которой заход не получает.\n'.repeat(40);

let root: string;

/** Правило в дереве: описание полем, длинное тело и спутник рядом. */
function layRule(name: string, description: string): void {
    const dir: string = join(root, '.claude', 'skills', name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'SKILL.md'), `---\nname: ${name}\ndescription: ${description}\n---\n\n${LONG_BODY}`, 'utf8');
    writeFileSync(join(dir, 'implementation.md'), 'привязка правила к коду\n', 'utf8');
}

/** Хук старта, который печатает своё слово: заход получает его вывод, а не его исходник. */
function layGlossaryHook(): void {
    const dir: string = join(root, '.claude', 'hooks');
    mkdirSync(dir, { recursive: true });
    const path: string = join(dir, 'glossary-load.sh');
    writeFileSync(path, `#!/bin/sh\ncat >/dev/null\nprintf '%s' '${SPOKEN_BY_HOOK}'\n`, 'utf8');
    chmodSync(path, 0o755);
}

/** Снимок дерева: путь, размер и время правки каждого файла. По нему видна любая запись. */
function snapshotOf(dir: string): readonly string[] {
    const taken: string[] = [];
    const walk: (current: string) => void = (current: string): void => {
        for (const entry of readdirSync(current, { withFileTypes: true })) {
            const path: string = join(current, entry.name);
            if (entry.isDirectory()) {
                walk(path);
            } else {
                taken.push(`${path}:${statSync(path).size}:${statSync(path).mtimeMs}`);
            }
        }
    };
    walk(dir);
    return taken.sort();
}

beforeEach((): void => {
    root = mkdtempSync(join(tmpdir(), 'rt-cost-'));
    mkdirSync(join(root, 'docs', 'constitution'), { recursive: true });
    writeFileSync(join(root, 'docs', 'constitution', 'law.md'), '# Закон\n\nСтатья закона.\n', 'utf8');
    layRule('маленькое', 'короткое описание');
    layRule('большое-правило', 'описание правила подлиннее прежнего, но всё равно короче тела');
    layGlossaryHook();
});

afterEach((): void => {
    rmSync(root, { recursive: true, force: true });
});

describe('costOf', (): void => {
    it('SC-AK-613 — команда печатает три веса', (): void => {
        const cost: ICost = costOf(root, null);

        expect(cost.entry.chars).toBeGreaterThan(0);
        expect(cost.rule.chars).toBeGreaterThan(0);
        expect(cost.layer.chars).toBeGreaterThan(0);
    });

    it('SC-AK-614 — рядом с числами стоит, чем считано', (): void => {
        const cost: ICost = costOf(root, null);

        expect(cost.countedBy).not.toBe('');
        expect(costLines(cost, false)[0]).toContain(cost.countedBy);
    });

    it('SC-AK-615 — описание правила считается полем, а не файлом', (): void => {
        const file: string = readFileSync(join(root, '.claude', 'skills', 'большое-правило', 'SKILL.md'), 'utf8');
        const cost: ICost = costOf(root, null);

        expect(file.length).toBeGreaterThan(cost.entry.chars);
    });

    it('SC-AK-616 — словарь считается выводом хука, а не его исходником', (): void => {
        expect(entryTexts(root)).toContain(SPOKEN_BY_HOOK);
    });

    it('SC-AK-618 — названного правила в дереве нет', (): void => {
        expect((): ICost => costOf(root, 'такого-нет')).toThrow(CostUnavailableError);
    });

    it('SC-AK-619 — машиночитаемый вывод даёт те же числа', (): void => {
        const cost: ICost = costOf(root, null);

        expect(JSON.parse(costLines(cost, true).join('\n'))).toEqual(cost);
    });

    it('SC-AK-620 — команда ничего не пишет и в сеть не ходит', (): void => {
        const before: readonly string[] = snapshotOf(root);
        costOf(root, null);

        expect(snapshotOf(root)).toEqual(before);
        expect(readFileSync(join(__dirname, 'cost.ts'), 'utf8')).not.toMatch(/node:https?|fetch\(/);
    });

    it('SC-AK-623 — символы и байты печатаются оба и у кириллицы не равны', (): void => {
        const weighed: IWeighed = weigh('проба', ['кириллица']);

        expect(weighed.bytes).toBeGreaterThan(weighed.chars);
    });

    it('SC-AK-624 — слой в дереве не разложен', (): void => {
        rmSync(join(root, '.claude', 'skills'), { recursive: true, force: true });

        expect((): ICost => costOf(root, null)).toThrow(CostUnavailableError);
    });
});
