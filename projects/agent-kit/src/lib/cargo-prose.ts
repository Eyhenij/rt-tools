/**
 * Слог записи, уезжающей в приём: судится он до отправки, а не после неё.
 *
 * Запись груза читает человек, а пишет её заход — словами слоя правил. Проверка слога в дереве
 * есть, и гард зовёт её на правке всякого документа; груз уезжает командой, то есть мимо гарда.
 * Оттого требование обычных слов держалось над текстами дерева и не держалось над тем, что
 * уезжает соседу.
 *
 * Проверка берётся разложенной в дерево, а не из пакета: её признаки — словарь и запреты — лежат
 * в настройке дерева, и копия, запущенная из каталога пакета, считала бы по умолчаниям, а не по
 * тому, о чём дерево договорилось.
 *
 * Зовётся она запуском, а не ввозом в свой модуль: разложенный файл — модуль, а сборка прогона
 * спек переписывает ввоз в требование и роняет его на первой строке. Запуском проверка идёт под
 * тем же узлом, каким её зовёт гард правки, и отвечает находками разбором.
 *
 * Дерево, не разложившее проверку, отправляет как прежде: судить нечем, и молчание об этом
 * читалось бы как проверка, ничего не нашедшая.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { IPostmortemItem } from './cargo.js';

/** Имя разложенного файла проверки. Одно на все деревья: его даёт раскладка, а не дерево. */
const PROSE_CHECK: string = 'check-prose-style.mjs';

/** Довод, которым у проверки просят находки данными: текст уходит ей на вход. */
const JSON_FLAG: string = '--json';

/** Одна находка проверки: строка текста, что найдено и чем это заменить. */
export interface IProseFinding {
    readonly line: number;
    readonly what: string;
    readonly fix: string;
}

/** Проверка слога либо пусто, когда дерево её не разложило. */
export type TProseCheck = ((text: string) => readonly IProseFinding[]) | null;

/** Спросить у разложенной проверки находки одного текста: запуском, текстом на входе. */
function askCheck(path: string, text: string): readonly IProseFinding[] {
    const said: string = execFileSync(process.execPath, [path, JSON_FLAG], { input: text, encoding: 'utf8' });

    return JSON.parse(said) as readonly IProseFinding[];
}

/**
 * Разложенная проверка слога либо пусто.
 *
 * Путь собирается из раскладки дерева: каталог проверок объявлен настройкой, а имя файла —
 * пакетом. Собранный по умолчанию, он промахнулся бы мимо дерева, положившего проверки иначе.
 *
 * Найденный файл зовётся пустым текстом сразу: проверка, которая не отвечает разбором, обязана
 * сказать это здесь. Отдай она себя непроверенной — груз отбивался бы её поломкой на каждой
 * записи, и отказ говорил бы о слоге, а не о ней.
 */
export function proseCheckOf(root: string, checksDir: string): TProseCheck {
    const path: string = join(root, checksDir, PROSE_CHECK);

    if (!existsSync(path)) {
        return null;
    }

    const check: TProseCheck = (text: string): readonly IProseFinding[] => askCheck(path, text);

    try {
        check('');
    } catch {
        // Сломанная проверка отпускает груз: отправку она задержать не вправе, а о том, что
        // судить было нечем, скажет строка вывода — та же, что у дерева без проверки вовсе.
        return null;
    }

    return check;
}

/**
 * Чем запись отбита по слогу либо пустая строка, когда находок нет.
 *
 * Называется первая находка, а не все: строка вывода читается заходом, и список из десяти
 * находок в ней теряет ту одну, с которой начинают чинить. Остальные видны, когда позовут саму
 * проверку на файле.
 */
export function proseWhy(check: TProseCheck, text: string): string {
    if (check === null) {
        return '';
    }

    const found: readonly IProseFinding[] = check(text);

    if (found.length === 0) {
        return '';
    }

    const first: IProseFinding = found[0];

    const rest: string = found.length > 1 ? `, и ещё находок ${found.length - 1}` : '';

    return `слог: строка ${first.line} — «${first.what}» → ${first.fix}${rest}`;
}

/** Отбитый разбор происшествия: имя файла и причина. Отметки на диске у него нет — файл лежит как лежал. */
export interface IRefusedAnalysis {
    readonly file: string;
    readonly why: string;
}

/**
 * Разборы происшествия, отбитые по слогу.
 *
 * Стоит здесь, а не при отправке: у предложения отбой уже собран своим отбором, и второй такой же
 * рядом с ним читался бы как другое решение. Дерево без проверки не отбивает ни одного.
 */
export function refusedAnalysesOf(check: TProseCheck, analyses: readonly IPostmortemItem[]): readonly IRefusedAnalysis[] {
    return analyses
        .map((one: IPostmortemItem): IRefusedAnalysis => ({ file: one.file, why: proseWhy(check, one.text) }))
        .filter((one: IRefusedAnalysis): boolean => Boolean(one.why));
}
